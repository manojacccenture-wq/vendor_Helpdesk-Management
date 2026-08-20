import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../../shared/notifications';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../shared/components/Card.jsx';
import { Input } from '../../../../../shared/components/Input.jsx';
import { Select } from '../../../../../shared/components/Select.jsx';
import { Textarea } from '../../../../../shared/components/Textarea.jsx';
import { FileUpload } from '../../../../../shared/components/FileUpload.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { TicketSuccessModal } from '../../../../../shared/components/TicketSuccessModal.jsx';
import { selectUserProfile, selectUserDepartments } from '../../../../../features/user/store/selectors.js';
import {
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetTicketStatusesQuery,
  useGetPrioritiesQuery,
  useCreateTicketMutation,
  useGetSubCategoryCtrlMappingQuery,
  useGetUsersByDepartmentQuery
} from '../../../../../shared/api/apiSlice.js';
import { zodResolver } from '@hookform/resolvers/zod';
import { baseTicketSchema } from '../validation/createTicketSchema.js';
import { buildDynamicSchema } from '../utils/dynamicSchemaBuilder.js';
import { DynamicField } from './DynamicField.jsx';
import { SubjectField } from './SubjectField.jsx';
import { Paperclip } from 'lucide-react';
import { mailService } from '../../../../../shared/services';
import { sendNotification, NOTIFICATION_TYPES } from '../../../../../shared/services/emailNotifications.js';
import { formatTicketNo } from '../../../../../shared/utils/ticket.js';

export const VendorTicketForm = ({ onSubmitTicket }) => {
  const profile = useSelector(selectUserProfile);
  const userDepartments = useSelector(selectUserDepartments);
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  
  // State for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketNo, setCreatedTicketNo] = useState('');
  const pendingResponseRef = useRef(null);
  
  // Map userDepartments from Redux to dropdown format (memoized)
  const departments = useMemo(
    () => userDepartments?.map(d => ({ label: d.deptName, value: d.deptId })) || [],
    [userDepartments]
  );
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
      issueOwner: '',
      subject: '',
      categoryId: '',
      subCategoryId: '',
      attachments: [],
      description: ''
    }
  });

  // Destructure register results for fields that need custom onChange cascade logic
  const categoryFieldProps = register('categoryId');
  const departmentFieldProps = register('departmentId');

  const selectedDepartmentId = watch('departmentId');
  const selectedCategoryId = watch('categoryId');

  // Fetch users for selected department (Issue Owner)
  const { data: issueOwnerUsers = [], isLoading: isLoadingIssueOwners, isFetching: isFetchingIssueOwners } =
    useGetUsersByDepartmentQuery(selectedDepartmentId, { skip: !selectedDepartmentId });

  // Map users to Select-compatible format (memoized)
  const issueOwnerOptions = useMemo(
    () => (issueOwnerUsers || []).map(u => ({
      label: `${u.name || u.username || ''} (${u.userCode || ''})`,
      value: u.userCode || ''
    })),
    [issueOwnerUsers]
  );

  const selectedSubCategoryId = watch('subCategoryId');

  const { data: subCategories = [], isLoading: isLoadingSubCategories, isFetching: isFetchingSubCategories } = useGetSubCategoriesQuery(selectedCategoryId, {
    skip: !selectedCategoryId
  });

  // Memoized option arrays for Category and Sub Category dropdowns
  const categoryOptions = useMemo(
    () => categories?.map(c => ({ label: c.text ?? c.Text, value: c.value ?? c.Value })) || [],
    [categories]
  );
  const subCategoryOptions = useMemo(
    () => subCategories?.map(c => ({ label: c.text ?? c.Text, value: c.value ?? c.Value })) || [],
    [subCategories]
  );

  const { data: dynamicControls = [], isFetching: isFetchingControls } = useGetSubCategoryCtrlMappingQuery(selectedSubCategoryId, {
    skip: !selectedSubCategoryId
  });

  const previousControlsRef = useRef([]);

  // Derive metadata from the selected subcategory (memoized)
  const selectedSubCategory = useMemo(
    () => subCategories.find((sc) => String(sc.value ?? sc.Value) === String(selectedSubCategoryId)),
    [subCategories, selectedSubCategoryId]
  );

  const parsedMetadata = useMemo(() => {
    const raw = selectedSubCategory?.metadata;
    if (!raw || typeof raw !== 'string') return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [selectedSubCategory?.metadata]);

  const isMetadataRequired = parsedMetadata?.required === true;
  const metadataAttachments = parsedMetadata?.attachments;
  const hasMetadata = parsedMetadata !== null && Array.isArray(metadataAttachments) && metadataAttachments.length > 0;

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
      formData.append('CategoryId', parseInt(data.categoryId, 10));
      if (data.subCategoryId) {
        formData.append('SubcategoryId', parseInt(data.subCategoryId, 10));
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

      // VendorDeptId (selected department)
      if (data.departmentId) {
        formData.append('VendorDeptId', parseInt(data.departmentId, 10));
      }

      // Issue Owner (userCode)
      if (data.issueOwner) {
        formData.append('IssueOwnerUserCode', data.issueOwner);
      }

      // Append Dynamic Fields
      const baseKeys = ['departmentId', 'issueOwner', 'subject', 'categoryId', 'subCategoryId', 'attachments', 'description'];
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
      
      // Extract ticket number from response
      const ticketNo = response?.ticketNo || response?.TicketNo || response?.ticketNumber || response?.id || '';
      setCreatedTicketNo(ticketNo);
      
      // Store response for later callback after modal is dismissed
      pendingResponseRef.current = response;
      
      // Show success modal immediately — do NOT wait for email
      setShowSuccessModal(true);
      reset();

      // Non-blocking email notification (fire-and-forget)
      // Matrix: Ticket Created → TO=VHD, CC=Vendor, Vendor Mail=YES
      sendNotification(NOTIFICATION_TYPES.TICKET_CREATED, {
        ticketNo,
        subject: data.subject,
        status: initialStatus?.text || 'Open',
        priority: mediumPriority?.text || 'Medium',
        vendorEmail: profile?.email,
      });

    } catch (error) {
      // TODO: Implement standard error toast handling
      console.error('Failed to create ticket', error);
    }
  };

  const handleViewTickets = () => {
    setShowSuccessModal(false);
    // Call the callback after modal is dismissed
    if (onSubmitTicket && pendingResponseRef.current) {
      onSubmitTicket(pendingResponseRef.current);
      pendingResponseRef.current = null;
    }
    navigate('/vendor');
  };

  return (
    <>
    <TicketSuccessModal 
      isOpen={showSuccessModal}
      ticketNo={createdTicketNo}
      onViewTickets={handleViewTickets}
    />
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          
          <SubjectField control={control} register={register} subjectError={errors.subject?.message} />

          {/* Base Dropdowns Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Select
              label="Department *"
              placeholder={departments.length === 0 ? 'No departments assigned' : 'Select Department'}
              error={errors.departmentId?.message}
              options={departments}
              disabled={departments.length === 0}
              name={departmentFieldProps.name}
              ref={departmentFieldProps.ref}
              onBlur={departmentFieldProps.onBlur}
              onChange={(e) => {
                departmentFieldProps.onChange(e);
                setValue('issueOwner', '');
              }}
            />

            <Select
              label="Issue Owner *"
              placeholder={
                !selectedDepartmentId
                  ? 'Select Department first'
                  : isLoadingIssueOwners
                    ? 'Loading...'
                    : issueOwnerOptions.length === 0
                      ? 'No users available'
                      : 'Select Issue Owner'
              }
              error={errors.issueOwner?.message}
              options={issueOwnerOptions}
              disabled={
                !selectedDepartmentId ||
                isLoadingIssueOwners ||
                isFetchingIssueOwners ||
                issueOwnerOptions.length === 0
              }
              {...register('issueOwner')}
            />

            <Select
              label="Category *"
              placeholder={isLoadingCategories ? 'Loading...' : 'Select Category'}
              error={errors.categoryId?.message}
              options={categoryOptions}
              disabled={isLoadingCategories}
              name={categoryFieldProps.name}
              ref={categoryFieldProps.ref}
              onBlur={categoryFieldProps.onBlur}
              onChange={(e) => {
                categoryFieldProps.onChange(e);
                setValue('subCategoryId', '');
              }}
            />
            
            <Select
              label="Sub Category"
              placeholder={isFetchingSubCategories ? 'Loading...' : 'Select Sub Category'}
              error={errors.subCategoryId?.message}
              options={subCategoryOptions}
              disabled={!selectedCategoryId || isFetchingSubCategories}
              {...register('subCategoryId')}
            />
          </div>

          {/* Dynamic Controls Section */}
          {dynamicControls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 border-t border-default mt-2">
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
            <div className="text-secondary italic">Loading category requirements...</div>
          )}

          {/* Description Section */}
          <div className="w-full">
            <Textarea 
              label="Detailed Description *"
              placeholder="Provide detailed description..."
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          {/* File Upload Section */}
          <div className="w-full pt-2 border-t border-default mt-2">
            {hasMetadata && (
              <div className="mb-3 p-3 rounded-control border border-default bg-surface-hover">
                <div className="flex items-center gap-2 mb-1.5">
                  <Paperclip className="h-4 w-4" />
                  <span className={`text-sm font-medium ${isMetadataRequired ? 'text-danger' : 'text-primary-hover'}`}>
                    Attachments {isMetadataRequired ? 'Required' : 'Optional'}{isMetadataRequired && ' *'}
                  </span>
                </div>
                <p className="text-xs text-secondary mb-1">
                  {isMetadataRequired
                    ? 'The following documents are required:'
                    : 'The following documents can be uploaded:'}
                </p>
                <ul className="list-none pl-0 m-0">
                  {metadataAttachments.map((att, idx) => (
                    <li key={idx} className="text-xs text-secondary">
                      • {att.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Controller
              name="attachments"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <FileUpload 
                  label={isMetadataRequired ? 'Attachments *' : 'Attachments (Optional)'}
                  onChange={onChange}
                  value={value}
                  ref={ref}
                  error={errors.attachments?.message}
                  multiple={true}
                />
              )}
            />
          </div>

          {/* Actions Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-default mt-2">
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
    </>
  );
};
