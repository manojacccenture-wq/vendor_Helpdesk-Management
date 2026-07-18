import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../shared/components/Card.jsx';

export const VendorInfoCard = ({ vendor = {} }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vendor Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Name</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">{vendor.name || '---'}</p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Username</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">{vendor.username || '---'}</p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">User Code</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">{vendor.userCode || '---'}</p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Email</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">{vendor.email || '---'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
