import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, Pencil, Trash2, Check, ImageIcon, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emptyBusiness = {
  id: '',
  businessName: '',
  businessAddress: '',
  bankDetails: '',
  email: '',
  phone: '',
  logo: null,
  currency: 'GBP',
};

function BusinessForm({ initial, onSave, onCancel, isNew }) {
  const [form, setForm] = useState(initial);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(prev => ({ ...prev, logo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
      <p className="text-sm font-semibold text-foreground">{isNew ? 'Add New Business' : 'Edit Business'}</p>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/50 shrink-0">
          {form.logo ? (
            <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
          )}
        </div>
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors">
          Upload Logo
          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Business Name *</Label>
          <Input placeholder="My Company LLC" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Business Address</Label>
          <Textarea placeholder="123 Main St, City, Country" value={form.businessAddress} onChange={(e) => update('businessAddress', e.target.value)} rows={2} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Bank Details</Label>
          <Textarea placeholder="Bank Name: ...&#10;Account Number: ..." value={form.bankDetails} onChange={(e) => update('bankDetails', e.target.value)} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Email</Label>
          <Input type="email" placeholder="billing@company.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Phone</Label>
          <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" className="gap-1.5" onClick={() => onSave(form)} disabled={!form.businessName.trim()}>
          <Check className="w-3.5 h-3.5" />
          {isNew ? 'Add Business' : 'Save Changes'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function BusinessManager({ businesses, activeBusiness, onSaveBusinesses, onSetActive, onDeleteBusiness }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [flash, setFlash] = useState('');

  const showFeedback = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2200);
  };

  const handleAdd = (form) => {
    const newBiz = { ...form, id: Date.now().toString() };
    const updated = [...businesses, newBiz];
    onSaveBusinesses(updated);
    if (!activeBusiness) onSetActive(newBiz.id);
    setShowForm(false);
    showFeedback('Business saved');
  };

  const handleEdit = (form) => {
    const updated = businesses.map(b => b.id === form.id ? form : b);
    onSaveBusinesses(updated);
    setEditingId(null);
    showFeedback('Business updated');
  };

  const handleDelete = (id) => {
    onDeleteBusiness(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold font-heading text-foreground">Businesses</h2>
          <p className="text-sm text-muted-foreground">Manage your businesses and select the active one</p>
        </div>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-sm text-green-600 font-medium"
          >
            <Check className="w-4 h-4" />
            {flash}
          </motion.div>
        )}
      </AnimatePresence>

      {businesses.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No businesses yet. Add your first one below.</p>
        </div>
      )}

      <div className="space-y-2">
        {businesses.map(biz => (
          <div key={biz.id}>
            {editingId === biz.id ? (
              <BusinessForm
                initial={biz}
                onSave={handleEdit}
                onCancel={() => setEditingId(null)}
                isNew={false}
              />
            ) : (
              <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${activeBusiness === biz.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-border bg-card hover:shadow-sm'}`} onClick={() => onSetActive(biz.id)}>
                <div className="w-9 h-9 rounded-md border border-border overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center">
                  {biz.logo ? (
                    <img src={biz.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-4 h-4 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate">{biz.businessName}</p>
                    {activeBusiness === biz.id && (
                      <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-semibold shrink-0">Active</span>
                    )}
                  </div>
                  {(biz.email || biz.phone) && (
                    <p className="text-xs text-muted-foreground truncate">{biz.email || biz.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {activeBusiness !== biz.id && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-accent hover:text-accent" title="Set as active" onClick={() => onSetActive(biz.id)}>
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(biz.id)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(biz.id)}
                    aria-label={`Delete ${biz.businessName}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm ? (
        <BusinessForm
          initial={{ ...emptyBusiness }}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
          isNew={true}
        />
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Business
        </Button>
      )}
    </div>
  );
}
