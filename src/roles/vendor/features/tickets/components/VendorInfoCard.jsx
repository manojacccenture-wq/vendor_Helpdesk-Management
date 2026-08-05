import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../shared/components/Card.jsx';
import { maskMobile, maskGst, maskPan, maskAddress, maskEmail } from '../../../../../shared/utils/masking.js';

export const VendorInfoCard = ({ vendor = {} }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showSensitive, setShowSensitive] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle>Vendor Information</CardTitle>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSensitive(!showSensitive);
            }}
            className="text-[13px] font-[500] text-[#0F766E] hover:underline"
            aria-label={showSensitive ? "Hide Sensitive Information" : "Show Sensitive Information"}
          >
            {showSensitive ? "Hide Details" : "Show Details"}
          </button>
          {isOpen ? <ChevronUp className="w-5 h-5 text-[#64748B]" /> : <ChevronDown className="w-5 h-5 text-[#64748B]" />}
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Name</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">{vendor.name || '---'}</p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Username</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">{vendor.username || '---'}</p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Vendor Code</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">{vendor.userCode || '---'}</p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Email</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">
              {showSensitive ? (vendor.email || '---') : (maskEmail(vendor.email) || '---')}
            </p>
          </div>
          {/* New fields pending backend integration */}
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Mobile Number</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">
              {showSensitive ? (vendor.mobile || '---') : (maskMobile(vendor.mobile) || '---')}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">GST Number</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">
              {showSensitive ? (vendor.gst || '---') : (maskGst(vendor.gst) || '---')}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">PAN Number</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">
              {showSensitive ? (vendor.pan || '---') : (maskPan(vendor.pan) || '---')}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-[500] text-[#64748B] mb-1">Address</p>
            <p className="text-[14px] font-[500] text-[#1E293B]">
              {showSensitive ? (vendor.address || '---') : (maskAddress(vendor.address) || '---')}
            </p>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  );
};
