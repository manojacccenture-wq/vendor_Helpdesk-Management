import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../shared/components/Card.jsx';
import { maskMobile, maskGst, maskPan, maskAddress, maskEmail } from '../../../../../shared/utils/masking.js';

export const VendorInfoCard = ({ vendor = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  return (
    <Card className="w-full border-l-4 border-l-success">
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
            className="text-success hover:underline"
            aria-label={showSensitive ? "Hide Sensitive Information" : "Show Sensitive Information"}
          >
            {showSensitive ? "Hide Details" : "Show Details"}
          </button>
          {isOpen ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <small className="text-secondary mb-1 block">Name</small>
            <p className="text-primary">{vendor.name || '---'}</p>
          </div>
          <div>
            <small className="text-secondary mb-1 block">Username</small>
            <p className="text-primary">{vendor.username || '---'}</p>
          </div>
          <div>
            <small className="text-secondary mb-1 block">Vendor Code</small>
            <p className="text-primary">{vendor.userCode || '---'}</p>
          </div>
          <div>
            <small className="text-secondary mb-1 block">Email</small>
            <p className="text-primary">
              {showSensitive ? (vendor.email || '---') : (maskEmail(vendor.email) || '---')}
            </p>
          </div>
          {/* New fields pending backend integration */}
          <div>
            <small className="text-secondary mb-1 block">Mobile Number</small>
            <p className="text-primary">
              {showSensitive ? (vendor.mobile || '---') : (maskMobile(vendor.mobile) || '---')}
            </p>
          </div>
          <div>
            <small className="text-secondary mb-1 block">GST Number</small>
            <p className="text-primary">
              {showSensitive ? (vendor.gst || '---') : (maskGst(vendor.gst) || '---')}
            </p>
          </div>
          <div>
            <small className="text-secondary mb-1 block">PAN Number</small>
            <p className="text-primary">
              {showSensitive ? (vendor.pan || '---') : (maskPan(vendor.pan) || '---')}
            </p>
          </div>
          <div>
            <small className="text-secondary mb-1 block">Address</small>
            <p className="text-primary">
              {showSensitive ? (vendor.address || '---') : (maskAddress(vendor.address) || '---')}
            </p>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  );
};
