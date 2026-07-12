import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getUser } from '../utils/api';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Alert, { AlertDescription } from '../components/common/Alert';
import { validateRequired, validateEmail } from '../utils/validation';
import { 
  Building2, 
  Users, 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserCheck, 
  Power, 
  AlertTriangle 
} from 'lucide-react';

/**
 * Organization Setup Page
 * Manages Departments, Asset Categories, and Employee directory tabs with in-memory CRUD operations.
 */
const OrganizationSetup = () => {
  const navigate = useNavigate();
  // --------------------------------------------------
  // DATABASES (Fetched from Express Backend API)
  // --------------------------------------------------
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchAllData = () => {
    apiFetch('/departments')
      .then(data => setDepartments(data))
      .catch(err => console.error('Fetch departments failed:', err));

    apiFetch('/categories')
      .then(data => setCategories(data))
      .catch(err => console.error('Fetch categories failed:', err));

    apiFetch('/employees')
      .then(data => setEmployees(data))
      .catch(err => console.error('Fetch employees failed:', err));
  };

  useEffect(() => {
    const profile = getUser();
    if (!profile) {
      navigate('/login');
      return;
    }
    setCurrentUser(profile);
    fetchAllData();
  }, [navigate]);

  // --------------------------------------------------
  // ACTIVE WORKSPACE STATES
  // --------------------------------------------------
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'categories' | 'employees'
  const [notification, setNotification] = useState(null); // { type: 'success'|'danger', message: string }

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Search & Filter state
  const [deptSearch, setDeptSearch] = useState('');
  const [deptStatusFilter, setDeptStatusFilter] = useState('All');

  const [catSearch, setCatSearch] = useState('');
  const [catStatusFilter, setCatStatusFilter] = useState('All');

  const [empSearch, setEmpSearch] = useState('');
  const [empStatusFilter, setEmpStatusFilter] = useState('All');

  // Pagination states
  const itemsPerPage = 5;
  const [deptPage, setDeptPage] = useState(1);
  const [catPage, setCatPage] = useState(1);
  const [empPage, setEmpPage] = useState(1);

  // Form states and errors
  const [formErrors, setFormErrors] = useState({});

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false,
  });

  const triggerConfirmation = (title, message, onConfirm, isDestructive = false) => {
    setConfirmConfig({ title, message, onConfirm, isDestructive });
    setIsConfirmOpen(true);
  };

  // Target item for update/edit
  const [editingItem, setEditingItem] = useState(null); // holds the item object during edits

  // --------------------------------------------------
  // INDIVIDUAL FORM FIELD BINDINGS
  // --------------------------------------------------
  // Department Form fields
  const [deptName, setDeptName] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [parentDept, setParentDept] = useState('');
  const [deptStatus, setDeptStatus] = useState('Active');

  // Category Form fields
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catWarranty, setCatWarranty] = useState('');
  const [catDepreciation, setCatDepreciation] = useState('');
  const [catStatus, setCatStatus] = useState('Active');

  // Employee Form fields
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empStatus, setEmpStatus] = useState('Active');

  // Role Form fields
  const [empNewRole, setEmpNewRole] = useState('Employee');

  // Helper arrays for options
  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Active'), [employees]);
  const activeDepartments = useMemo(() => departments.filter(d => d.status === 'Active'), [departments]);

  // --------------------------------------------------
  // SUMMARY METRICS CALCULATORS
  // --------------------------------------------------
  const metrics = useMemo(() => {
    return {
      totalDepts: departments.length,
      totalCats: categories.length,
      totalEmps: employees.length,
      activeEmps: employees.filter(e => e.status === 'Active').length,
    };
  }, [departments, categories, employees]);

  // --------------------------------------------------
  // TAB 1: DEPARTMENTS LOGIC (CRUD, SEARCH, FILTER)
  // --------------------------------------------------
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchSearch = dept.name.toLowerCase().includes(deptSearch.toLowerCase()) || 
                          dept.head.toLowerCase().includes(deptSearch.toLowerCase());
      const matchStatus = deptStatusFilter === 'All' ? true : dept.status === deptStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [departments, deptSearch, deptStatusFilter]);

  const paginatedDepts = useMemo(() => {
    const start = (deptPage - 1) * itemsPerPage;
    return filteredDepartments.slice(start, start + itemsPerPage);
  }, [filteredDepartments, deptPage]);

  const openAddDept = () => {
    setEditingItem(null);
    setDeptName('');
    setDeptHead('');
    setParentDept('');
    setDeptStatus('Active');
    setFormErrors({});
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept) => {
    setEditingItem(dept);
    setDeptName(dept.name);
    setDeptHead(dept.head);
    setParentDept(dept.parent);
    setDeptStatus(dept.status);
    setFormErrors({});
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = (e) => {
    e.preventDefault();
    setFormErrors({});
    const errors = {};

    const nameErr = validateRequired(deptName, 'Department name');
    if (nameErr) errors.name = nameErr;

    const duplicate = departments.find(d => 
      d.name.trim().toLowerCase() === deptName.trim().toLowerCase() && 
      (!editingItem || d.id !== editingItem.id)
    );
    if (duplicate) {
      errors.name = 'A department with this name already exists.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: deptName.trim(),
      head: deptHead || 'None',
      parent: parentDept,
      status: deptStatus
    };

    if (editingItem) {
      apiFetch(`/departments/${editingItem.id}`, {
        method: 'PUT',
        body: payload
      })
        .then(() => {
          showNotification('success', `Department "${deptName}" updated successfully.`);
          fetchAllData();
          setIsDeptModalOpen(false);
        })
        .catch(err => {
          showNotification('danger', err.message || 'Error updating department.');
        });
    } else {
      apiFetch('/departments', {
        method: 'POST',
        body: payload
      })
        .then(() => {
          showNotification('success', `Department "${deptName}" created successfully.`);
          fetchAllData();
          setIsDeptModalOpen(false);
        })
        .catch(err => {
          showNotification('danger', err.message || 'Error creating department.');
        });
    }
  };

  const handleDeactivateDept = (dept) => {
    if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Asset Manager') {
      showNotification('danger', 'Only Administrators or Asset Managers can modify department profiles.');
      return;
    }

    triggerConfirmation(
      'Deactivate Department',
      `Are you sure you want to deactivate the "${dept.name}" department? Active personnel allocations will be flagged.`,
      () => {
        apiFetch(`/departments/${dept.id}`, {
          method: 'PUT',
          body: {
            name: dept.name,
            head: dept.head,
            parent: dept.parent,
            status: 'Inactive'
          }
        })
          .then(() => {
            showNotification('warning', `Department "${dept.name}" has been deactivated.`);
            fetchAllData();
          })
          .catch(err => showNotification('danger', err.message || 'Error deactivating department.'));
      },
      true
    );
  };

  const handleDeleteDept = (dept) => {
    if (currentUser?.role !== 'Admin') {
      showNotification('danger', 'Only Administrators can permanently delete department records.');
      return;
    }

    triggerConfirmation(
      'Delete Department',
      `Are you sure you want to permanently delete the "${dept.name}" department? This action is irreversible.`,
      () => {
        apiFetch(`/departments/${dept.id}`, {
          method: 'DELETE'
        })
          .then(() => {
            showNotification('danger', `Department "${dept.name}" has been deleted.`);
            fetchAllData();
          })
          .catch(err => showNotification('danger', err.message || 'Error deleting department.'));
      },
      true
    );
  };

  // --------------------------------------------------
  // TAB 2: ASSET CATEGORIES LOGIC (CRUD, SEARCH, FILTER)
  // --------------------------------------------------
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchSearch = cat.name.toLowerCase().includes(catSearch.toLowerCase()) || 
                          cat.description.toLowerCase().includes(catSearch.toLowerCase());
      const matchStatus = catStatusFilter === 'All' ? true : cat.status === catStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [categories, catSearch, catStatusFilter]);

  const paginatedCats = useMemo(() => {
    const start = (catPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, catPage]);

  const openAddCat = () => {
    setEditingItem(null);
    setCatName('');
    setCatDesc('');
    setCatWarranty('');
    setCatDepreciation('');
    setCatStatus('Active');
    setFormErrors({});
    setIsCatModalOpen(true);
  };

  const openEditCat = (cat) => {
    setEditingItem(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatWarranty(cat.warrantyPeriod || '');
    setCatDepreciation(cat.depreciationYears || '');
    setCatStatus(cat.status);
    setFormErrors({});
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (e) => {
    e.preventDefault();
    setFormErrors({});
    const errors = {};

    const nameErr = validateRequired(catName, 'Category name');
    if (nameErr) errors.name = nameErr;

    const descErr = validateRequired(catDesc, 'Description');
    if (descErr) errors.desc = descErr;

    const duplicate = categories.find(c => 
      c.name.trim().toLowerCase() === catName.trim().toLowerCase() && 
      (!editingItem || c.id !== editingItem.id)
    );
    if (duplicate) {
      errors.name = 'An asset category with this name already exists.';
    }

    if (catWarranty !== '' && (isNaN(catWarranty) || Number(catWarranty) < 0)) {
      errors.warranty = 'Warranty must be a non-negative number.';
    }
    if (catDepreciation !== '' && (isNaN(catDepreciation) || Number(catDepreciation) < 0)) {
      errors.depreciation = 'Depreciation must be a non-negative number.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: catName.trim(),
      description: catDesc.trim(),
      warrantyPeriod: catWarranty !== '' ? Number(catWarranty) : null,
      depreciationYears: catDepreciation !== '' ? Number(catDepreciation) : null,
      status: catStatus,
    };

    if (editingItem) {
      apiFetch(`/categories/${editingItem.id}`, {
        method: 'PUT',
        body: payload
      })
        .then(() => {
          showNotification('success', `Asset Category "${catName}" updated successfully.`);
          fetchAllData();
          setIsCatModalOpen(false);
        })
        .catch(err => showNotification('danger', err.message || 'Error updating category.'));
    } else {
      apiFetch('/categories', {
        method: 'POST',
        body: payload
      })
        .then(() => {
          showNotification('success', `Asset Category "${catName}" created successfully.`);
          fetchAllData();
          setIsCatModalOpen(false);
        })
        .catch(err => showNotification('danger', err.message || 'Error creating category.'));
    }
  };

  const handleDeactivateCat = (cat) => {
    if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Asset Manager') {
      showNotification('danger', 'Only Administrators or Asset Managers can modify category profiles.');
      return;
    }

    triggerConfirmation(
      'Deactivate Category',
      `Are you sure you want to deactivate the "${cat.name}" category? New assets cannot be logged under deactivated categories.`,
      () => {
        apiFetch(`/categories/${cat.id}`, {
          method: 'PUT',
          body: {
            name: cat.name,
            description: cat.description,
            warrantyPeriod: cat.warrantyPeriod,
            depreciationYears: cat.depreciationYears,
            status: 'Inactive'
          }
        })
          .then(() => {
            showNotification('warning', `Asset Category "${cat.name}" has been deactivated.`);
            fetchAllData();
          })
          .catch(err => showNotification('danger', err.message || 'Error deactivating category.'));
      },
      true
    );
  };

  const handleDeleteCat = (cat) => {
    if (currentUser?.role !== 'Admin') {
      showNotification('danger', 'Only Administrators can permanently delete category configurations.');
      return;
    }

    triggerConfirmation(
      'Delete Category',
      `Are you sure you want to permanently delete the "${cat.name}" category? All historical configuration templates will be cleared.`,
      () => {
        apiFetch(`/categories/${cat.id}`, {
          method: 'DELETE'
        })
          .then(() => {
            showNotification('danger', `Asset Category "${cat.name}" has been deleted.`);
            fetchAllData();
          })
          .catch(err => showNotification('danger', err.message || 'Error deleting category.'));
      },
      true
    );
  };

  // --------------------------------------------------
  // TAB 3: EMPLOYEE DIRECTORY LOGIC (CRUD, SEARCH, FILTER)
  // --------------------------------------------------
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(empSearch.toLowerCase()) || 
                          emp.email.toLowerCase().includes(empSearch.toLowerCase());
      const matchStatus = empStatusFilter === 'All' ? true : emp.status === empStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [employees, empSearch, empStatusFilter]);

  const paginatedEmps = useMemo(() => {
    const start = (empPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, empPage]);

  const openAddEmp = () => {
    setEditingItem(null);
    setEmpName('');
    setEmpEmail('');
    setEmpDept('');
    setEmpStatus('Active');
    setFormErrors({});
    setIsEmpModalOpen(true);
  };

  const openEditEmp = (emp) => {
    setEditingItem(emp);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpDept(emp.department);
    setEmpStatus(emp.status);
    setFormErrors({});
    setIsEmpModalOpen(true);
  };

  const openAssignRole = (emp) => {
    setEditingItem(emp);
    setEmpNewRole(emp.role);
    setIsRoleModalOpen(true);
  };

  const handleSaveEmp = (e) => {
    e.preventDefault();
    setFormErrors({});
    const errors = {};

    const nameErr = validateRequired(empName, 'Full name');
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(empEmail);
    if (emailErr) errors.email = emailErr;

    const deptErr = validateRequired(empDept, 'Department selection');
    if (deptErr) errors.dept = deptErr;

    const duplicate = employees.find(emp => 
      emp.email.trim().toLowerCase() === empEmail.trim().toLowerCase() && 
      (!editingItem || emp.id !== editingItem.id)
    );
    if (duplicate) {
      errors.email = 'An employee with this email address already exists.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: empName.trim(),
      email: empEmail.trim().toLowerCase(),
      department: empDept,
      status: empStatus
    };

    if (editingItem) {
      apiFetch(`/employees/${editingItem.id}`, {
        method: 'PUT',
        body: payload
      })
        .then(() => {
          showNotification('success', `Employee "${empName}" updated successfully.`);
          fetchAllData();
          setIsEmpModalOpen(false);
        })
        .catch(err => showNotification('danger', err.message || 'Error updating employee record.'));
    } else {
      apiFetch('/employees', {
        method: 'POST',
        body: payload
      })
        .then(() => {
          showNotification('success', `Employee "${empName}" registered successfully.`);
          fetchAllData();
          setIsEmpModalOpen(false);
        })
        .catch(err => showNotification('danger', err.message || 'Error registering employee.'));
    }
  };

  const handleUpdateRole = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    apiFetch(`/employees/${editingItem.id}/assign-role`, {
      method: 'PUT',
      body: { role: empNewRole }
    })
      .then(() => {
        showNotification('success', `Role for "${editingItem.name}" updated to "${empNewRole}".`);
        fetchAllData();
        setIsRoleModalOpen(false);
      })
      .catch(err => showNotification('danger', err.message || 'Error assigning role.'));
  };

  const handleDeactivateEmp = (emp) => {
    if (currentUser?.role !== 'Admin') {
      showNotification('danger', 'Only Administrators can deactivate employee profiles.');
      return;
    }

    triggerConfirmation(
      'Deactivate Employee Profile',
      `Are you sure you want to deactivate the login profile for "${emp.name}"? They will lose access to corporate assets.`,
      () => {
        apiFetch(`/employees/${emp.id}`, {
          method: 'PUT',
          body: {
            name: emp.name,
            email: emp.email,
            department: emp.department,
            status: 'Inactive'
          }
        })
          .then(() => {
            showNotification('warning', `Employee "${emp.name}" profile deactivated.`);
            fetchAllData();
          })
          .catch(err => showNotification('danger', err.message || 'Error deactivating employee.'));
      },
      true
    );
  };

  const handleDeleteEmp = (emp) => {
    if (currentUser?.role !== 'Admin') {
      showNotification('danger', 'Only Administrators can permanently delete employee records.');
      return;
    }

    triggerConfirmation(
      'Delete Employee Record',
      `Are you sure you want to remove the database profile for "${emp.name}"? Allocation records will remain archived.`,
      () => {
        apiFetch(`/employees/${emp.id}`, {
          method: 'DELETE'
        })
          .then(() => {
            showNotification('danger', `Employee "${emp.name}" deleted successfully.`);
            fetchAllData();
          })
          .catch(err => showNotification('danger', err.message || 'Error deleting employee.'));
      },
      true
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in">
        
        {/* Dynamic global alerts */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 w-full max-w-md shadow-lg">
            <Alert variant={notification.type}>
              <div className="flex items-center justify-between">
                <AlertDescription className="font-semibold text-sm">
                  {notification.message}
                </AlertDescription>
                <button 
                  onClick={() => setNotification(null)}
                  className="text-xs ml-4 opacity-80 hover:opacity-100 font-bold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </Alert>
          </div>
        )}

        {/* Page title header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader 
            title="Organization Setup" 
            description="Manage organizational units, structure directories, asset category policies, and employee role access configurations."
          />
        </div>

        {/* METRICS HEADER CARDS BLOCK */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-xl border border-blue-100 flex-shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider block">Departments</span>
              <span className="text-xl font-bold text-text-primary block">{metrics.totalDepts} Units</span>
            </div>
          </Card>
          
          <Card className="p-4 bg-white flex items-center gap-4">
            <div className="p-3 bg-green-50 text-success rounded-xl border border-green-100 flex-shrink-0">
              <Layers className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider block">Asset Categories</span>
              <span className="text-xl font-bold text-text-primary block">{metrics.totalCats} Types</span>
            </div>
          </Card>

          <Card className="p-4 bg-white flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-warning rounded-xl border border-amber-100 flex-shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider block">Total Directory</span>
              <span className="text-xl font-bold text-text-primary block">{metrics.totalEmps} Employees</span>
            </div>
          </Card>

          <Card className="p-4 bg-white flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 flex-shrink-0">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider block">Active Roster</span>
              <span className="text-xl font-bold text-text-primary block">{metrics.activeEmps} Active</span>
            </div>
          </Card>
        </div>

        {/* WORKSPACE TAB SWITCHER */}
        <div className="flex border-b border-border bg-white rounded-xl shadow-premium p-1">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'departments'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            <Building2 className="h-4.5 w-4.5" />
            <span>Departments</span>
          </button>
          
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'categories'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            <Layers className="h-4.5 w-4.5" />
            <span>Asset Categories</span>
          </button>
          
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'employees'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Employee Directory</span>
          </button>
        </div>

        {/* TAB WORKSPACES CONTENT BLOCK */}
        <Card className="bg-white p-6 shadow-premium">
          
          {/* -------------------------------------------------- */}
          {/* TAB 1: DEPARTMENTS VIEW */}
          {/* -------------------------------------------------- */}
          {activeTab === 'departments' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search departments..."
                      value={deptSearch}
                      onChange={(e) => {
                        setDeptSearch(e.target.value);
                        setDeptPage(1);
                      }}
                      className="w-full h-10 pl-10 pr-4 bg-white border border-border rounded-lg text-sm transition-colors duration-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
                    />
                  </div>
                  {/* Filter */}
                  <div className="w-[160px] flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <select
                      value={deptStatusFilter}
                      onChange={(e) => {
                        setDeptStatusFilter(e.target.value);
                        setDeptPage(1);
                      }}
                      className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary appearance-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <Button onClick={openAddDept} className="gap-2 self-start sm:self-auto flex-shrink-0">
                  <Plus className="h-4.5 w-4.5" />
                  Add Department
                </Button>
              </div>

              {/* Table viewport */}
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider select-none">
                      <th className="px-6 py-4">Department ID</th>
                      <th className="px-6 py-4">Department Name</th>
                      <th className="px-6 py-4">Department Head</th>
                      <th className="px-6 py-4">Parent Department</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm text-text-primary font-medium">
                    {paginatedDepts.length > 0 ? (
                      paginatedDepts.map((dept) => (
                        <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                          <td className="px-6 py-4 text-xs font-mono text-text-secondary">{dept.id}</td>
                          <td className="px-6 py-4 font-bold">{dept.name}</td>
                          <td className="px-6 py-4 text-text-secondary">{dept.head}</td>
                          <td className="px-6 py-4">
                            {dept.parent ? (
                              <Badge variant="primary">{dept.parent}</Badge>
                            ) : (
                              <span className="text-xs text-slate-400">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={dept.status === 'Active' ? 'success' : 'secondary'}>
                              {dept.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditDept(dept)}
                                className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-primary hover:border-blue-200 transition-colors focus-ring"
                                title="Edit Department"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {dept.status === 'Active' && (
                                <button
                                  onClick={() => handleDeactivateDept(dept)}
                                  className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-warning hover:border-amber-200 transition-colors focus-ring"
                                  title="Deactivate Department"
                                >
                                  <Power className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteDept(dept)}
                                className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-danger hover:border-red-200 transition-colors focus-ring"
                                title="Delete Department"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <EmptyState 
                            title="No departments found"
                            description="No departments match your current query or filter tags."
                            actionButton={
                              (deptSearch || deptStatusFilter !== 'All') && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setDeptSearch('');
                                    setDeptStatusFilter('All');
                                  }}
                                >
                                  Reset Filters
                                </Button>
                              )
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={deptPage}
                totalItems={filteredDepartments.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setDeptPage(page)}
              />
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* TAB 2: ASSET CATEGORIES VIEW */}
          {/* -------------------------------------------------- */}
          {activeTab === 'categories' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search asset categories..."
                      value={catSearch}
                      onChange={(e) => {
                        setCatSearch(e.target.value);
                        setCatPage(1);
                      }}
                      className="w-full h-10 pl-10 pr-4 bg-white border border-border rounded-lg text-sm transition-colors duration-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
                    />
                  </div>
                  {/* Filter */}
                  <div className="w-[160px] flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <select
                      value={catStatusFilter}
                      onChange={(e) => {
                        setCatStatusFilter(e.target.value);
                        setCatPage(1);
                      }}
                      className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary appearance-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <Button onClick={openAddCat} className="gap-2 self-start sm:self-auto flex-shrink-0">
                  <Plus className="h-4.5 w-4.5" />
                  Add Category
                </Button>
              </div>

              {/* Table viewport */}
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider select-none">
                      <th className="px-6 py-4">Category ID</th>
                      <th className="px-6 py-4">Category Name</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Warranty</th>
                      <th className="px-6 py-4">Depreciation</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm text-text-primary font-medium">
                    {paginatedCats.length > 0 ? (
                      paginatedCats.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                          <td className="px-6 py-4 text-xs font-mono text-text-secondary">{cat.id}</td>
                          <td className="px-6 py-4 font-bold">{cat.name}</td>
                          <td className="px-6 py-4 text-text-secondary max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{cat.description}</td>
                          <td className="px-6 py-4 text-text-secondary text-xs">
                            {cat.warrantyPeriod ? `${cat.warrantyPeriod} Year(s)` : <span className="text-slate-400">-</span>}
                          </td>
                          <td className="px-6 py-4 text-text-secondary text-xs">
                            {cat.depreciationYears ? `${cat.depreciationYears} Year(s)` : <span className="text-slate-400">-</span>}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={cat.status === 'Active' ? 'success' : 'secondary'}>
                              {cat.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditCat(cat)}
                                className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-primary hover:border-blue-200 transition-colors focus-ring"
                                title="Edit Category"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {cat.status === 'Active' && (
                                <button
                                  onClick={() => handleDeactivateCat(cat)}
                                  className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-warning hover:border-amber-200 transition-colors focus-ring"
                                  title="Deactivate Category"
                                >
                                  <Power className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteCat(cat)}
                                className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-danger hover:border-red-200 transition-colors focus-ring"
                                title="Delete Category"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <EmptyState 
                            title="No asset categories found"
                            description="No categories match your current query or filter tags."
                            actionButton={
                              (catSearch || catStatusFilter !== 'All') && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setCatSearch('');
                                    setCatStatusFilter('All');
                                  }}
                                >
                                  Reset Filters
                                </Button>
                              )
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={catPage}
                totalItems={filteredCategories.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCatPage(page)}
              />
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* TAB 3: EMPLOYEE DIRECTORY VIEW */}
          {/* -------------------------------------------------- */}
          {activeTab === 'employees' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search employees by name/email..."
                      value={empSearch}
                      onChange={(e) => {
                        setEmpSearch(e.target.value);
                        setEmpPage(1);
                      }}
                      className="w-full h-10 pl-10 pr-4 bg-white border border-border rounded-lg text-sm transition-colors duration-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
                    />
                  </div>
                  {/* Filter */}
                  <div className="w-[160px] flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <select
                      value={empStatusFilter}
                      onChange={(e) => {
                        setEmpStatusFilter(e.target.value);
                        setEmpPage(1);
                      }}
                      className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary appearance-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <Button onClick={openAddEmp} className="gap-2 self-start sm:self-auto flex-shrink-0">
                  <Plus className="h-4.5 w-4.5" />
                  Add Employee
                </Button>
              </div>

              {/* Table viewport */}
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider select-none">
                      <th className="px-6 py-4">Employee ID</th>
                      <th className="px-6 py-4">Employee Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Current Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm text-text-primary font-medium">
                    {paginatedEmps.length > 0 ? (
                      paginatedEmps.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                          <td className="px-6 py-4 text-xs font-mono text-text-secondary">{emp.id}</td>
                          <td className="px-6 py-4 font-bold">{emp.name}</td>
                          <td className="px-6 py-4 text-text-secondary text-xs">{emp.email}</td>
                          <td className="px-6 py-4">
                            <Badge variant="primary">{emp.department}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={
                                emp.role === 'Department Head' 
                                  ? 'warning' 
                                  : emp.role === 'Asset Manager' 
                                    ? 'info' 
                                    : 'secondary'
                              }
                            >
                              {emp.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={emp.status === 'Active' ? 'success' : 'secondary'}>
                              {emp.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditEmp(emp)}
                                className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-primary hover:border-blue-200 transition-colors focus-ring"
                                title="Edit Employee Details"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              
                              {emp.status === 'Active' && (
                                <>
                                  <button
                                    onClick={() => openAssignRole(emp)}
                                    className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-primary hover:border-blue-200 transition-colors focus-ring"
                                    title="Assign Role / Promote"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeactivateEmp(emp)}
                                    className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-warning hover:border-amber-200 transition-colors focus-ring"
                                    title="Deactivate Profile"
                                  >
                                    <Power className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteEmp(emp)}
                                className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:text-danger hover:border-red-200 transition-colors focus-ring"
                                title="Delete Record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <EmptyState 
                            title="No employee records found"
                            description="No employees match your search text or status tags."
                            actionButton={
                              (empSearch || empStatusFilter !== 'All') && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setEmpSearch('');
                                    setEmpStatusFilter('All');
                                  }}
                                >
                                  Reset Filters
                                </Button>
                              )
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={empPage}
                totalItems={filteredEmployees.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setEmpPage(page)}
              />
            </div>
          )}

        </Card>

      </div>

      {/* -------------------------------------------------- */}
      {/* MODAL WINDOWS */}
      {/* -------------------------------------------------- */}

      {/* 1. Department Creation/Modification Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingItem ? 'Edit Department Profile' : 'Register New Department'}
        size="md"
      >
        <form onSubmit={handleSaveDept} className="flex flex-col gap-4">
          <Input
            id="deptName"
            label="Department Name"
            placeholder="e.g. Finance, Legal"
            value={deptName}
            onChange={(e) => {
              setDeptName(e.target.value);
              if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
            }}
            error={formErrors.name}
            required
          />

          <Select
            id="deptHead"
            label="Department Head"
            placeholder="Select manager from active staff roster"
            value={deptHead}
            onChange={(e) => setDeptHead(e.target.value)}
            options={activeEmployees.map(e => ({ value: e.name, label: `${e.name} (${e.role})` }))}
          />

          <Select
            id="parentDept"
            label="Parent Department (Optional)"
            placeholder="No Parent unit"
            value={parentDept}
            onChange={(e) => setParentDept(e.target.value)}
            options={activeDepartments
              .filter(d => !editingItem || d.id !== editingItem.id) // exclude self to prevent looping
              .map(d => ({ value: d.name, label: d.name }))}
          />

          <Select
            id="deptStatus"
            label="Functional Status"
            value={deptStatus}
            onChange={(e) => setDeptStatus(e.target.value)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />

          <div className="flex items-center justify-end gap-2.5 mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Asset Category Creation/Modification Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingItem ? 'Edit Asset Category Config' : 'Create New Asset Category'}
        size="md"
      >
        <form onSubmit={handleSaveCat} className="flex flex-col gap-4">
          <Input
            id="catName"
            label="Category Name"
            placeholder="e.g. IT Equipment, Lab Gears"
            value={catName}
            onChange={(e) => {
              setCatName(e.target.value);
              if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
            }}
            error={formErrors.name}
            required
          />

          <Input
            id="catDesc"
            label="Category Policy Description"
            placeholder="Describe the asset category classifications"
            value={catDesc}
            onChange={(e) => {
              setCatDesc(e.target.value);
              if (formErrors.desc) setFormErrors(prev => ({ ...prev, desc: '' }));
            }}
            error={formErrors.desc}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="catWarranty"
              label="Warranty Period (Years)"
              placeholder="e.g. 3"
              type="number"
              min="0"
              value={catWarranty}
              onChange={(e) => {
                setCatWarranty(e.target.value);
                if (formErrors.warranty) setFormErrors(prev => ({ ...prev, warranty: '' }));
              }}
              error={formErrors.warranty}
              helperText="Warranty period in years"
            />

            <Input
              id="catDepreciation"
              label="Depreciation Cycle (Years)"
              placeholder="e.g. 5"
              type="number"
              min="0"
              value={catDepreciation}
              onChange={(e) => {
                setCatDepreciation(e.target.value);
                if (formErrors.depreciation) setFormErrors(prev => ({ ...prev, depreciation: '' }));
              }}
              error={formErrors.depreciation}
              helperText="Financial depreciation range"
            />
          </div>

          <Select
            id="catStatus"
            label="Status"
            value={catStatus}
            onChange={(e) => setCatStatus(e.target.value)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />

          <div className="flex items-center justify-end gap-2.5 mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Employee Directory Registration/Edit Modal */}
      <Modal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        title={editingItem ? 'Edit Employee Details' : 'Register New Corporate Employee'}
        size="md"
      >
        <form onSubmit={handleSaveEmp} className="flex flex-col gap-4">
          <Input
            id="empName"
            label="Full Name"
            placeholder="e.g. Samuel L. Jackson"
            value={empName}
            onChange={(e) => {
              setEmpName(e.target.value);
              if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
            }}
            error={formErrors.name}
            required
          />

          <Input
            id="empEmail"
            label="Business Email Address"
            placeholder="samuel.j@company.com"
            type="email"
            value={empEmail}
            onChange={(e) => {
              setEmpEmail(e.target.value);
              if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
            }}
            error={formErrors.email}
            required
          />

          <Select
            id="empDept"
            label="Primary Department"
            placeholder="Select assigned corporate division"
            value={empDept}
            onChange={(e) => {
              setEmpDept(e.target.value);
              if (formErrors.dept) setFormErrors(prev => ({ ...prev, dept: '' }));
            }}
            error={formErrors.dept}
            options={activeDepartments.map(d => ({ value: d.name, label: d.name }))}
            required
          />

          <Select
            id="empStatus"
            label="Personnel Status"
            value={empStatus}
            onChange={(e) => setEmpStatus(e.target.value)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />

          {/* Prompt constraint reminder */}
          <div className="p-3.5 bg-blue-50 border border-blue-100 text-[11px] text-blue-800 rounded-xl leading-relaxed">
            <strong>NOTE:</strong> Every newly registered employee starts automatically as an <strong>Employee</strong> role. Promoting or changing roles must be managed post-creation via the <strong>Assign Role</strong> action list.
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsEmpModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Promote / Role Assignment Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Assign Corporate Access Role"
        size="md"
      >
        <form onSubmit={handleUpdateRole} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 p-4 bg-slate-50 border border-border rounded-xl">
            <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider">Employee Name</span>
            <span className="text-sm font-bold text-text-primary">{editingItem?.name}</span>
          </div>

          <div className="flex flex-col gap-1 p-4 bg-slate-50 border border-border rounded-xl">
            <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider">Current Role</span>
            <span className="text-sm">
              <Badge variant="primary">{editingItem?.role}</Badge>
            </span>
          </div>

          <Select
            id="empNewRole"
            label="Select New Corporate Role"
            value={empNewRole}
            onChange={(e) => setEmpNewRole(e.target.value)}
            options={[
              { value: 'Employee', label: 'Employee' },
              { value: 'Department Head', label: 'Department Head (Manager)' },
              { value: 'Asset Manager', label: 'Asset Manager (Supervisor)' },
            ]}
            required
          />

          <div className="flex items-center justify-end gap-2.5 mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. General Destructive Action Confirmation Dialog */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmConfig.title}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-50 text-danger border border-red-100 rounded-xl mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <h4 className="text-sm font-bold text-text-primary">Confirm critical operation</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {confirmConfig.message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmConfig.isDestructive ? 'primary' : 'secondary'}
              className={confirmConfig.isDestructive ? 'bg-danger hover:bg-red-700 text-white border-none' : ''}
              size="sm"
              onClick={() => {
                confirmConfig.onConfirm();
                setIsConfirmOpen(false);
              }}
            >
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>

    </AppLayout>
  );
};

export default OrganizationSetup;
export { OrganizationSetup };
