import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../shared/components/Card.jsx';
import { Input } from '../../../../../shared/components/Input.jsx';
import { Select } from '../../../../../shared/components/Select.jsx';
import { Textarea } from '../../../../../shared/components/Textarea.jsx';
import { FileUpload } from '../../../../../shared/components/FileUpload.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { selectUserProfile } from '../../../../../features/user/store/selectors.js';
import {
  useGetDepartmentsQuery,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetTicketStatusesQuery,
  useGetPrioritiesQuery,
  useCreateTicketMutation,
  useGetSubCategoryCtrlMappingQuery
} from '../../../../../shared/api/apiSlice.js';
import { zodResolver } from '@hookform/resolvers/zod';
import { baseTicketSchema } from '../validation/createTicketSchema.js';
import { buildDynamicSchema } from '../utils/dynamicSchemaBuilder.js';
import { DynamicField } from './DynamicField.jsx';

export const VendorTicketForm = ({ onSubmitTicket }) => {
  const profile = useSelector(selectUserProfile);
  
  const { data: departments = [], isLoading: isLoadingDepartments } = useGetDepartmentsQuery();
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: statuses = [] } = useGetTicketStatusesQuery();
  const { data: priorities = [] } = useGetPrioritiesQuery();
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();

  const [currentSchema, setCurrentSchema] = useState(baseTicketSchema);

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue, unregister } = useForm({
    resolver: zodResolver(currentSchema),
    mode: 'onTouched',
    defaultValues: {
      departmentId: '',
      subject: '',
      categoryId: '',
      subCategoryId: '',
      attachments: [],
      description: ''
    }
  });

  const selectedCategoryId = watch('categoryId');
  const selectedSubCategoryId = watch('subCategoryId');
  const subjectValue = watch('subject') || '';
  const isSubjectAtLimit = subjectValue.length >= 40;
  const isSubjectNearLimit = subjectValue.length >= 35;

  const { data: subCategories = [], isLoading: isLoadingSubCategories, isFetching: isFetchingSubCategories } = useGetSubCategoriesQuery(selectedCategoryId, {
    skip: !selectedCategoryId
  });

  const { data: dynamicControls = [], isFetching: isFetchingControls } = useGetSubCategoryCtrlMappingQuery(selectedSubCategoryId, {
    skip: !selectedSubCategoryId
  });

  const previousControlsRef = useRef([]);

  // Cascade clear subCategory when category changes
  useEffect(() => {
    setValue('subCategoryId', '');
  }, [selectedCategoryId, setValue]);

  // Handle Dynamic Schema and Unregistering Old Fields
  useEffect(() => {
    // 1. Build and set new schema
    const newSchema = buildDynamicSchema(baseTicketSchema, dynamicControls);
    setCurrentSchema(newSchema);

    // 2. Cleanup old fields from form state if they don't exist in new controls
    const previousNames = previousControlsRef.current.map(c => c.columnName);
    const currentNames = dynamicControls.map(c => c.columnName);
    
    const namesToRemove = previousNames.filter(name => !currentNames.includes(name));
    if (namesToRemove.length > 0) {
      unregister(namesToRemove);
    }
    
    previousControlsRef.current = dynamicControls;
  }, [dynamicControls, unregister]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Base fields
      formData.append('Subject', data.subject);
      formData.append('Description', data.description);
      formData.append('CategoryId', data.categoryId);
      if (data.subCategoryId) {
        formData.append('SubcategoryId', data.subCategoryId);
      }
      
      // Dynamic Priority mapped to 'MEDIUM'
      const mediumPriority = priorities.find(p => p.text?.toUpperCase() === 'MEDIUM');
      formData.append('PriorityId', mediumPriority ? mediumPriority.value : 3);
      
      // Temporary IDs (until backend update)
      formData.append('VendorId', profile?.userCode ? parseInt(profile.userCode, 10) : 1);
      formData.append('CreatedBy', profile?.username || 'vendor_admin');
      
      const initialStatus = statuses.find(s => s.text?.toUpperCase() === 'OPEN') || statuses[0];
      if (initialStatus) {
        formData.append('StatusId', initialStatus.value || 1);
      }

      // Append Dynamic Fields
      const baseKeys = ['departmentId', 'subject', 'categoryId', 'subCategoryId', 'attachments', 'description'];
      Object.keys(data).forEach(key => {
        if (!baseKeys.includes(key)) {
          if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
            formData.append(key, data[key]);
          }
        }
      });

      // Append files
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach(file => {
          formData.append('Attachments', file);
        });
      }

      // Execute API call
      const response = await createTicket(formData).unwrap();
      
      if (onSubmitTicket) onSubmitTicket(response);
      reset(); 
      
    } catch (error) {
      // TODO: Implement standard error toast handling
      console.error('Failed to create ticket', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          
          <div className="w-full relative">
            <div className="absolute top-0 right-0 flex items-center h-[20px]">
              <span className={`text-[12px] font-[500] ${isSubjectAtLimit ? 'text-[#EF4444]' : isSubjectNearLimit ? 'text-[#F59E0B]' : 'text-[#64748B]'}`}>
                {subjectValue.length} / 40
              </span>
            </div>
            <Input 
              label="Subject *" 
              placeholder="Enter brief issue subject"
              error={errors.subject?.message}
              maxLength={40}
              {...register('subject')}
            />
            {isSubjectAtLimit && !errors.subject && (
              <span className="text-[12px] text-[#F59E0B] mt-1.5 block">
                Maximum 40 characters allowed.
              </span>
            )}
          </div>

          {/* Base Dropdowns Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Select
              label="Department *"
              placeholder={isLoadingDepartments ? 'Loading...' : 'Select Department'}
              error={errors.departmentId?.message}
              options={departments?.map(d => ({ label: d.text ?? d.Text, value: d.value ?? d.Value })) || []}
              disabled={isLoadingDepartments}
              {...register('departmentId')}
            />

            <Select
              label="Category *"
              placeholder={isLoadingCategories ? 'Loading...' : 'Select Category'}
              error={errors.categoryId?.message}
              options={categories?.map(c => ({ label: c.text ?? c.Text, value: c.value ?? c.Value })) || []}
              disabled={isLoadingCategories}
              {...register('categoryId')}
            />
            
            <Select
              label="Sub Category"
              placeholder={isFetchingSubCategories ? 'Loading...' : 'Select Sub Category'}
              error={errors.subCategoryId?.message}
              options={subCategories?.map(c => ({ label: c.text ?? c.Text, value: c.value ?? c.Value })) || []}
              disabled={!selectedCategoryId || isFetchingSubCategories}
              {...register('subCategoryId')}
            />
          </div>

          {/* Dynamic Controls Section */}
          {dynamicControls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 border-t border-[#E2E8F0] mt-2">
              {dynamicControls.map((control) => (
                <DynamicField 
                  key={control.columnName}
                  control={control}
                  register={register}
                  error={errors[control.columnName]?.message}
                  disabled={isFetchingControls}
                />
              ))}
            </div>
          )}

          {isFetchingControls && dynamicControls.length === 0 && (
            <div className="text-[13px] text-[#64748B] italic">Loading category requirements...</div>
          )}

          {/* File Upload Section */}
          <div className="w-full pt-2 border-t border-[#E2E8F0] mt-2">
            <Controller
              name="attachments"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <FileUpload 
                  label="Attachments (Optional)"
                  onChange={onChange}
                  value={value}
                  ref={ref}
                  error={errors.attachments?.message}
                  multiple={true}
                />
              )}
            />
          </div>

          {/* Description Section */}
          <div className="w-full">
            <Textarea 
              label="Detailed Description *"
              placeholder="Provide detailed description..."
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          {/* Actions Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#E2E8F0] mt-2">
            <Button type="button" variant="ghost" onClick={() => reset()} disabled={isSubmitting}>
              Reset
            </Button>
            
            <div className="flex-1 hidden sm:block"></div>
            
            <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
};
