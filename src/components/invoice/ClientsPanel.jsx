import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Pencil, Trash2, Check, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emptyClient = { name: '', address: '', email: '' };

function ClientForm({ initial, onSave, onCancel, isNew }) {
  const [form, setForm] = useState(initial);
  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="grid gap-3 p-4 rounded-lg border border-border bg-muted/20">
      <p className="text-sm font-semibold">{isNew ? 'Add Client' : 'Edit Client'}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Name *</Label>
          <Input placeholder="Client name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Email</Label>
          <Input type="email" placeholder="client@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Address</Label>
          <Textarea placeholder="Client address" value={form.address} onChange={(e) => update('address', e.target.value)} rows={2} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-1.5" onClick={() => onSave(form)} disabled={!form.name.trim()}>
          <Check className="w-3.5 h-3.5" />
          {isNew ? 'Add Client' : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function ClientsPanel({ clients, onSaveClients, onSelectClient }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [flash, setFlash] = useState('');

  const showFeedback = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2000);
  };

  const handleAdd = (form) => {
    const newClient = { ...form, id: Date.now().toString() };
    onSaveClients([...clients, newClient]);
    setShowForm(false);
    showFeedback('Client saved');
  };

  const handleEdit = (form) => {
    onSaveClients(clients.map(c => c.id === form.id ? form : c));
    setEditingId(null);
    showFeedback('Client updated');
  };

  const handleDelete = (id) => {
    onSaveClients(clients.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold font-heading text-foreground">Clients</h2>
          <p className="text-sm text-muted-foreground">Manage reusable clients for invoicing</p>
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

      {clients.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No clients yet. Add your first client below.</p>
        </div>
      )}

      <div className="space-y-2">
        {clients.map(client => (
          <div key={client.id}>
            {editingId === client.id ? (
              <ClientForm
                initial={client}
                onSave={handleEdit}
                onCancel={() => setEditingId(null)}
                isNew={false}
              />
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{client.name}</p>
                  {(client.email || client.address) && (
                    <p className="text-xs text-muted-foreground truncate">{client.email || client.address}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-accent hover:text-accent" title="Use in invoice" onClick={() => onSelectClient(client)}>
                    <UserCheck className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(client.id)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(client.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm ? (
        <ClientForm
          initial={{ ...emptyClient }}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
          isNew={true}
        />
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      )}
    </div>
  );
}
