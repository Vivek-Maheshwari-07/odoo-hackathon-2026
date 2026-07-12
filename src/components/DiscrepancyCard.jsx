import React from 'react';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { AlertCircle, Wrench, MapPin } from 'lucide-react';

const DiscrepancyCard = ({ items }) => {
  const missing = items.filter(i => i.verificationStatus === 'Missing');
  const damaged = items.filter(i => i.verificationStatus === 'Damaged');
  const incorrectLocation = items.filter(i => i.incorrectLocation);

  const totalDiscrepancies = missing.length + damaged.length + incorrectLocation.length;

  const AssetRow = ({ item, flagText, flagColor }) => (
    <div className="flex flex-col gap-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-primary">{item.assetTag}</span>
        {flagText && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${flagColor}`}>{flagText}</span>}
      </div>
      <p className="font-bold text-text-primary text-xs mt-0.5">{item.assetName}</p>
      <div className="flex items-center gap-1 mt-1 text-[10px] text-text-secondary">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>Registered Loc: {item.location}</span>
      </div>
      {item.comments && (
        <div className="mt-1.5 p-1.5 bg-white border border-slate-100 rounded text-[10px] italic text-slate-600">
          Comment: "{item.comments}"
        </div>
      )}
    </div>
  );

  return (
    <Card className="p-5 bg-white shadow-sm border border-border rounded-xl">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Discrepancy Report</h3>
          <p className="text-xs text-text-secondary mt-0.5">Identified exceptions during this audit cycle.</p>
        </div>
        <Badge variant={totalDiscrepancies > 0 ? 'danger' : 'success'}>
          {totalDiscrepancies} {totalDiscrepancies === 1 ? 'issue' : 'issues'} flagged
        </Badge>
      </div>

      {totalDiscrepancies === 0 ? (
        <div className="py-8 text-center text-xs text-text-secondary font-medium">
          No discrepancies flagged in this audit cycle. All verified assets match records.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Missing Assets Section */}
          <div className="border border-red-100 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50/50 border-b border-red-100 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">Missing Assets ({missing.length})</span>
            </div>
            <div className="p-3 space-y-2.5 max-h-64 overflow-y-auto">
              {missing.length === 0 ? (
                <p className="text-[11px] text-text-secondary italic text-center py-4">No missing assets.</p>
              ) : (
                missing.map(item => (
                  <AssetRow key={item.id} item={item} flagText="MISSING" flagColor="bg-red-100 text-red-700" />
                ))
              )}
            </div>
          </div>

          {/* Damaged Assets Section */}
          <div className="border border-amber-100 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/50 border-b border-amber-100 text-amber-700">
              <Wrench className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">Damaged Assets ({damaged.length})</span>
            </div>
            <div className="p-3 space-y-2.5 max-h-64 overflow-y-auto">
              {damaged.length === 0 ? (
                <p className="text-[11px] text-text-secondary italic text-center py-4">No damaged assets.</p>
              ) : (
                damaged.map(item => (
                  <AssetRow key={item.id} item={item} flagText="DAMAGED" flagColor="bg-amber-100 text-amber-700" />
                ))
              )}
            </div>
          </div>

          {/* Location Discrepancies Section */}
          <div className="border border-purple-100 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50/50 border-b border-purple-100 text-purple-700">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">Wrong Location ({incorrectLocation.length})</span>
            </div>
            <div className="p-3 space-y-2.5 max-h-64 overflow-y-auto">
              {incorrectLocation.length === 0 ? (
                <p className="text-[11px] text-text-secondary italic text-center py-4">No location discrepancies.</p>
              ) : (
                incorrectLocation.map(item => (
                  <AssetRow key={item.id} item={item} flagText="WRONG LOCATION" flagColor="bg-purple-100 text-purple-700" />
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </Card>
  );
};

export default DiscrepancyCard;
