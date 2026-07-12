import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import { Building, Users } from 'lucide-react';

const AuditModal = ({ isOpen, onClose, onCreate, departments, employees }) => {
  const [form, setForm] = useState({
    auditName: '',
    departmentId: '',
    startDate: '',
    endDate: '',
    auditorIds: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        auditName: '',
        departmentId: departments[0]?.dbId || '',
        startDate: '',
        endDate: '',
        auditorIds: [],
      });
      setErrors({});
    }
  }, [isOpen, departments]);

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleAuditorCheckbox = (userId) => {
    setForm(prev => {
      const auditorIds = prev.auditorIds.includes(userId)
        ? prev.auditorIds.filter(id => id !== userId)
        : [...prev.auditorIds, userId];
      return { ...prev, auditorIds };
    });
    setErrors(prev => ({ ...prev, auditorIds: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.auditName.trim()) {
      newErrors.auditName = 'Audit Name is required.';
    }
    if (!form.departmentId) {
      newErrors.departmentId = 'Department is required.';
    }
    if (!form.startDate) {
      newErrors.startDate = 'Start date is required.';
    }
    if (!form.endDate) {
      newErrors.endDate = 'End date is required.';
    } else if (form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
      newErrors.endDate = 'End date cannot be before start date.';
    }
    if (form.auditorIds.length === 0) {
      newErrors.auditorIds = 'Select at least one auditor.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Audit Cycle" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Audit Cycle Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-primary">Audit Cycle Name *</label>
          <Input
            name="auditName"
            placeholder="e.g. Q3 Electronics Hardware Audit"
            value={form.auditName}
            onChange={handleField}
            error={errors.auditName}
          />
        </div>

        {/* Department Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-primary">Department / Location *</label>
          <div className="relative">
            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleField}
              className={`w-full h-10 px-3 py-2 bg-white border rounded-lg text-sm outline-none appearance-none pr-8
                ${errors.departmentId ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'}
                text-text-primary`}
            >
              <option value="" disabled>Select Department</option>
              {departments.map(d => (
                <option key={d.dbId} value={d.dbId}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          {errors.departmentId && <span className="text-xs text-red-500 font-medium">{errors.departmentId}</span>}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-primary">Start Date *</label>
            <Input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleField}
              error={errors.startDate}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-primary">End Date *</label>
            <Input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleField}
              error={errors.endDate}
            />
          </div>
        </div>

        {/* Assign Auditors Checkbox List */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-primary flex items-center gap-1">
            <Users className="h-4 w-4 text-slate-400" />
            Assign Auditor(s) *
          </label>
          <div className={`border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2.5 bg-slate-50
            ${errors.auditorIds ? 'border-red-400' : 'border-border'}`}>
            {employees.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-2">No active employees available.</p>
            ) : (
              employees.map(emp => (
                <div key={emp.userId} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`auditor-${emp.userId}`}
                    checked={form.auditorIds.includes(emp.userId)}
                    onChange={() => handleAuditorCheckbox(emp.userId)}
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor={`auditor-${emp.userId}`} className="text-xs text-text-primary cursor-pointer select-none">
                    <span className="font-bold">{emp.name}</span>
                    <span className="text-text-secondary"> ({emp.role} • {emp.designation})</span>
                  </label>
                </div>
              ))
            )}
          </div>
          {errors.auditorIds && <span className="text-xs text-red-500 font-medium">{errors.auditorIds}</span>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Cycle</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AuditModal;
