import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../shared/components/Card.jsx';
import { maskMobile, maskGst, maskPan, maskAddress, maskEmail } from '../../../../../shared/utils/masking.js';

export const VendorInfoCard = ({ vendor = {} }) => {
  const [isOpen, setIsOpen] = useState(true);
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
            className="sectionLabelClassName text-success hover:underline"
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
            <p className="badgeClassName text-secondary mb-1">Name</p>
            <p className="sectionLabelClassName text-primary">{vendor.name || '---'}</p>
          </div>
          <div>
            <p className="badgeClassName text-secondary mb-1">Username</p>
            <p className="sectionLabelClassName text-primary">{vendor.username || '---'}</p>
          </div>
          <div>
            <p className="badgeClassName text-secondary mb-1">Vendor Code</p>
            <p className="sectionLabelClassName text-primary">{vendor.userCode || '---'}</p>
          </div>
          <div>
            <p className="badgeClassName text-secondary mb-1">Email</p>
            <p className="sectionLabelClassName text-primary">
              {showSensitive ? (vendor.email || '---') : (maskEmail(vendor.email) || '---')}
            </p>
          </div>
          {/* New fields pending backend integration */}
          <div>
            <p className="badgeClassName text-secondary mb-1">Mobile Number</p>
            <p className="sectionLabelClassName text-primary">
              {showSensitive ? (vendor.mobile || '---') : (maskMobile(vendor.mobile) || '---')}
            </p>
          </div>
          <div>
            <p className="badgeClassName text-secondary mb-1">GST Number</p>
            <p className="sectionLabelClassName text-primary">
              {showSensitive ? (vendor.gst || '---') : (maskGst(vendor.gst) || '---')}
            </p>
          </div>
          <div>
            <p className="badgeClassName text-secondary mb-1">PAN Number</p>
            <p className="sectionLabelClassName text-primary">
              {showSensitive ? (vendor.pan || '---') : (maskPan(vendor.pan) || '---')}
            </p>
          </div>
          <div>
            <p className="badgeClassName text-secondary mb-1">Address</p>
            <p className="sectionLabelClassName text-primary">
              {showSensitive ? (vendor.address || '---') : (maskAddress(vendor.address) || '---')}
            </p>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  );
};
