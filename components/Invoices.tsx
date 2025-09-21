import React, { useState } from 'react';
import { Invoice, InvoiceItem } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { DownloadIcon } from './icons/NavIcons';

interface InvoicesProps {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number'>) => void;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

const Invoices: React.FC<InvoicesProps> = ({ invoices, addInvoice }) => {
  const today = new Date().toISOString().split('T')[0];
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [showPreview, setShowPreview] = useState<Invoice | null>(null);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoice: Omit<Invoice, 'id' | 'number'> = { clientName, clientAddress, issueDate, dueDate, items };
    addInvoice(newInvoice);
    // Reset form
    setClientName('');
    setClientAddress('');
    setItems([{ description: '', quantity: 1, price: 0 }]);
  };

  const calculateTotal = (invoiceItems: InvoiceItem[]) => 
    invoiceItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  if (showPreview) {
    const total = calculateTotal(showPreview.items);
    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
                    <p className="text-subtle">Invoice #: {showPreview.number}</p>
                </div>
                <Button onClick={() => setShowPreview(null)} className="w-full sm:w-auto">Back to Invoices</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-semibold mb-1">Billed To:</h3>
                    <p>{showPreview.clientName}</p>
                    <p className="text-subtle">{showPreview.clientAddress}</p>
                </div>
                <div className="text-left sm:text-right">
                    <p><strong>Issue Date:</strong> {showPreview.issueDate}</p>
                    <p><strong>Due Date:</strong> {showPreview.dueDate}</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left mb-8 min-w-[400px]">
                    <thead className="bg-slate-100">
                        <tr><th className="p-2">Description</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Total</th></tr>
                    </thead>
                    <tbody>
                        {showPreview.items.map((item, i) => (
                            <tr key={i} className="border-b"><td className="p-2">{item.description}</td><td className="p-2 text-center">{item.quantity}</td><td className="p-2 text-right">{formatCurrency(item.price)}</td><td className="p-2 text-right">{formatCurrency(item.quantity * item.price)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-right">
                <p className="text-lg">Subtotal: <span className="font-semibold">{formatCurrency(total)}</span></p>
                <p className="text-2xl font-bold">Total Due: <span className="text-primary">{formatCurrency(total)}</span></p>
            </div>
            <div className="mt-8 text-center">
                <Button onClick={() => alert('PDF download is a planned feature and will be available soon!')}>
                    <DownloadIcon />
                    <span className="ml-2">Download PDF</span>
                </Button>
            </div>
        </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Client Name" type="text" value={clientName} onChange={e => setClientName(e.target.value)} required />
            <Input label="Client Address" type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Issue Date" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required />
                <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>
            <hr/>
            <h3 className="font-semibold">Items</h3>
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-end gap-2 p-2 border rounded-md">
                <div className="w-full flex-grow space-y-1">
                    <Input label="Description" type="text" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input label="Qty" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} />
                        <Input label="Price" type="number" value={item.price} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} />
                    </div>
                </div>
                <Button type="button" onClick={() => removeItem(index)} className="bg-red-500 hover:bg-red-600 h-10 w-full sm:w-10 p-0 mt-2 sm:mt-0">X</Button>
              </div>
            ))}
            <Button type="button" onClick={addItem} className="w-full bg-slate-200 text-slate-700 hover:bg-slate-300">Add Item</Button>
            <hr/>
            <Button type="submit" className="w-full">Generate Invoice</Button>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
           
           {/* Mobile View */}
           <div className="md:hidden space-y-3">
             {invoices.length > 0 ? [...invoices].reverse().map(inv => (
                <div key={inv.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-mono text-primary font-semibold">{inv.number}</p>
                            <p className="font-medium">{inv.clientName}</p>
                            <p className="text-sm text-subtle">Due: {inv.dueDate}</p>
                        </div>
                        <p className="font-semibold text-lg">{formatCurrency(calculateTotal(inv.items))}</p>
                    </div>
                    <Button onClick={() => setShowPreview(inv)} className="py-1 px-3 text-sm mt-3 w-full">View Invoice</Button>
                </div>
             )) : <p className="text-subtle text-center py-4">No invoices yet.</p>}
           </div>

           {/* Desktop View */}
           <div className="hidden md:block">
            {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-2">Number</th><th className="p-2">Client</th><th className="p-2">Due Date</th><th className="p-2 text-right">Amount</th><th className="p-2"></th></tr></thead>
                    <tbody>
                        {[...invoices].reverse().map(inv => (
                        <tr key={inv.id} className="border-b hover:bg-slate-50">
                            <td className="p-2 font-mono text-primary">{inv.number}</td><td className="p-2">{inv.clientName}</td><td className="p-2 text-subtle">{inv.dueDate}</td>
                            <td className="p-2 text-right font-medium">{formatCurrency(calculateTotal(inv.items))}</td>
                            <td className="p-2 text-right"><Button onClick={() => setShowPreview(inv)} className="py-1 px-3 text-sm">View</Button></td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            ) : <p className="text-subtle text-center py-4">No invoices yet.</p>}
           </div>
        </Card>
      </div>
    </div>
  );
};

export default Invoices;