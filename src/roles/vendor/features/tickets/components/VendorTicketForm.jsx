import React, { useEffect } from 'react';
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
  useCreateTicketMutation
} from '../../../../../shared/api/apiSlice.js';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTicketSchema } from '../validation/createTicketSchema.js';

export const VendorTicketForm = ({ onSubmitTicket }) => {
  const profile = useSelector(selectUserProfile);
  
  // RTK Query Hooks for Master Data
  const { data: departments = [], isLoading: isLoadingDepartments } = useGetDepartmentsQuery();
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: statuses = [] } = useGetTicketStatusesQuery();
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(createTicketSchema),
    mode: 'onTouched',
    defaultValues: {
      departmentId: '',
      subject: '',
      categoryId: '',
      subCategoryId: '',
      attachments: null,
      description: ''
    }
  });

  const selectedCategoryId = watch('categoryId');

  // Fetch SubCategories only if a Category is selected
  const { data: subCategories = [], isLoading: isLoadingSubCategories, isFetching: isFetchingSubCategories } = useGetSubCategoriesQuery(selectedCategoryId, {
    skip: !selectedCategoryId
  });

  // Cascade clear subCategory when category changes
  useEffect(() => {
    setValue('subCategoryId', '');
  }, [selectedCategoryId, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      // TODO: Append DepartmentId to formData once the backend documentation is updated to require it
      // formData.append('DepartmentId', data.departmentId);
      
      formData.append('Subject', data.subject);
      formData.append('Description', data.description);
      formData.append('CategoryId', data.categoryId);
      if (data.subCategoryId) {
        formData.append('SubcategoryId', data.subCategoryId);
      }
      
      // TODO: Temporary hardcoded PriorityId until backend contract is updated to not require it from Vendor.
      // 2 typically represents 'Medium' priority.
      formData.append('PriorityId', 2);

      // --- TEMPORARY ASSUMPTIONS ---
      // TODO: Replace temporary VendorId mapping after backend confirmation.
      // Assuming vendorCode can be parsed, or hardcoding 1 for now if it's not a number.
      formData.append('VendorId', profile?.userCode ? parseInt(profile.userCode, 10) : 1);
      
      // TODO: Replace temporary CreatedBy once backend confirms if they extract it from token or need it explicit.
      formData.append('CreatedBy', profile?.username || 'vendor_admin');

      // TODO: Replace temporary StatusId once backend confirms default status behavior.
      // Trying to find 'OPEN' status from API, otherwise fallback to 1.
      const initialStatus = statuses.find(s => s.text?.toUpperCase() === 'OPEN') || statuses[0];
      formData.append('StatusId', initialStatus?.value || 1);
      // -----------------------------

      // Append file
      if (data.attachments) {
        formData.append('Attachments', data.attachments);
      }

      // Execute API call
      const response = await createTicket(formData).unwrap();
      
      
      if (onSubmitTicket) onSubmitTicket(response);
      
      reset(); // Clear form on success
      
    } catch (error) {
      
      // TODO: Implement standard error toast handling
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          
          <div className="w-full">
            <Input 
              label="Subject *" 
              placeholder="Enter brief issue subject"
              error={errors.subject?.message}
              {...register('subject')}
            />
          </div>

          {/* Dropdown Section */}
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

          {/* File Upload Section */}
          <div className="w-full">
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
