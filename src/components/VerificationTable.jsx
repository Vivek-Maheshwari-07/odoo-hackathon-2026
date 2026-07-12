import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import Button from './common/Button';
import { Save } from 'lucide-react';

const STATUS_COLOR = {
  Pending: 'default',
  Verified: 'success',
  Missing: 'danger',
  Damaged: 'warning',
};

const VerificationTable = ({ items, onSaveVerification, isReadOnly }) => {
  // Store local edits for each row
  const [edits, setEdits] = useState({});

  // Initialize/reset local edits when items change
  useEffect(() => {
    const initialEdits = {};
    items.forEach(item => {
      initialEdits[item.id] = {
        verificationStatus: item.verificationStatus === 'Pending' ? 'Verified' : item.verificationStatus,
        comments: item.comments || '',
        incorrectLocation: item.incorrectLocation || false,
      };
    });
    setEdits(initialEdits);
  }, [items]);

  const handleRowChange = (itemId, field, value) => {
    setEdits(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSave = (itemId) => {
    const rowEdit = edits[itemId];
    onSaveVerification(itemId, rowEdit);
  };

  return (
    <Card className="bg-white shadow-sm border border-border overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-border">
              <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Asset Details</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Location</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Current Status</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Verification Status</th>
              {!isReadOnly && (
                <>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide w-48">Comments</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide text-center">Incorrect Loc.</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide text-right">Actions</th>
                </>
              )}
              {isReadOnly && (
                <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Verification Details</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map(item => {
              const edit = edits[item.id] || {
                verificationStatus: 'Verified',
                comments: '',
                incorrectLocation: false,
              };

              // Highlight rows if missing or damaged
              let rowBg = 'hover:bg-slate-50';
              if (item.verificationStatus === 'Missing') {
                rowBg = 'bg-red-50/50 hover:bg-red-50';
              } else if (item.verificationStatus === 'Damaged') {
                rowBg = 'bg-amber-50/50 hover:bg-amber-50';
              }

              return (
                <tr key={item.id} className={`transition-colors duration-200 ${rowBg}`}>
                  {/* Asset Tag & Name */}
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-bold text-primary">{item.assetTag}</p>
                    <p className="font-semibold text-text-primary mt-0.5">{item.assetName}</p>
                  </td>

                  {/* Registered Location */}
                  <td className="px-5 py-4 text-xs font-medium text-text-secondary">
                    {item.location}
                  </td>

                  {/* Current Lifecycle Status */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold text-slate-600">{item.currentStatus}</span>
                  </td>

                  {/* Verification Status Badge */}
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_COLOR[item.verificationStatus] || 'default'}>
                      {item.verificationStatus}
                    </Badge>
                    {item.incorrectLocation && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                        Wrong Loc
                      </span>
                    )}
                  </td>

                  {/* Verification Actions (Write-Mode vs Read-Only) */}
                  {!isReadOnly ? (
                    <>
                      {/* Dropdown status selector & comments inline */}
                      <td className="px-5 py-4" colSpan="1">
                        <div className="flex flex-col gap-2">
                          <select
                            value={edit.verificationStatus}
                            onChange={(e) => handleRowChange(item.id, 'verificationStatus', e.target.value)}
                            className="w-32 h-8 px-2 bg-white border border-border rounded-lg text-xs font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
                          >
                            <option value="Verified">Verified</option>
                            <option value="Missing">Missing</option>
                            <option value="Damaged">Damaged</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          placeholder="Add comments..."
                          value={edit.comments}
                          onChange={(e) => handleRowChange(item.id, 'comments', e.target.value)}
                          className="w-full h-8 px-2 bg-white border border-border rounded-lg text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
                        />
                      </td>

                      {/* Incorrect Location Checkbox */}
                      <td className="px-5 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={edit.incorrectLocation}
                          onChange={(e) => handleRowChange(item.id, 'incorrectLocation', e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer inline-block"
                        />
                      </td>

                      {/* Action Button */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          onClick={() => handleSave(item.id)}
                          size="sm"
                          className="flex items-center gap-1 text-[11px] h-8"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                      </td>
                    </>
                  ) : (
                    /* Read-Only Mode */
                    <td className="px-5 py-4 text-xs text-text-secondary" colSpan="3">
                      {item.verificationStatus === 'Pending' ? (
                        <span className="italic text-slate-400">Not verified yet</span>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="font-semibold text-text-primary">
                            Verified by: <span className="font-bold">{item.verifiedBy || 'System'}</span>
                          </p>
                          {item.comments && <p className="italic text-slate-600">"{item.comments}"</p>}
                          <p className="text-[10px] text-slate-400">Date: {item.verifiedAt}</p>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default VerificationTable;
