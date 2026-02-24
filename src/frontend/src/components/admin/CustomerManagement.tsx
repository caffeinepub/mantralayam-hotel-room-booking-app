import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Users, Search, Edit, Trash2, Download, ExternalLink, 
  FileSpreadsheet, Copy, Check, AlertCircle 
} from 'lucide-react';
import { 
  getAllCustomers, searchCustomers, updateCustomer, deleteCustomer, 
  type Customer 
} from '../../lib/customerStorage';
import { 
  getGoogleSheetsConfig, saveGoogleSheetsConfig, 
  type GoogleSheetsConfig 
} from '../../lib/googleSheetsConfigStorage';
import { downloadCustomerCSV, copyCustomerCSVToClipboard } from '../../lib/customerCsvExport';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState<Customer | null>(null);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig | null>(null);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [showSheetsConfig, setShowSheetsConfig] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);

  useEffect(() => {
    loadData();
    
    const handleUpdate = () => loadData();
    window.addEventListener('customersUpdated', handleUpdate);
    window.addEventListener('googleSheetsConfigUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('customersUpdated', handleUpdate);
      window.removeEventListener('googleSheetsConfigUpdated', handleUpdate);
    };
  }, []);

  const loadData = () => {
    setCustomers(getAllCustomers());
    const config = getGoogleSheetsConfig();
    setSheetsConfig(config);
    if (config) {
      setSheetsUrl(config.sheetUrl);
    }
  };

  const filteredCustomers = searchQuery 
    ? searchCustomers(searchQuery) 
    : customers;

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
  };

  const handleEditSave = () => {
    if (!editingCustomer) return;
    
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editPhone.trim()) {
      toast.error('Phone is required');
      return;
    }
    
    const updated = updateCustomer(editingCustomer.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
    });
    
    if (updated) {
      toast.success('Customer updated successfully');
      setEditingCustomer(null);
      loadData();
    } else {
      toast.error('Failed to update customer');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmCustomer) return;
    
    const success = deleteCustomer(deleteConfirmCustomer.id);
    if (success) {
      toast.success('Customer deleted successfully');
      setDeleteConfirmCustomer(null);
      loadData();
    } else {
      toast.error('Failed to delete customer');
    }
  };

  const handleSaveSheetsConfig = () => {
    if (!sheetsUrl.trim()) {
      toast.error('Please enter a Google Sheets URL');
      return;
    }
    
    saveGoogleSheetsConfig(sheetsUrl);
    toast.success('Google Sheets link saved successfully');
    setShowSheetsConfig(false);
    loadData();
  };

  const handleDownloadCSV = () => {
    downloadCustomerCSV(filteredCustomers);
    toast.success('CSV file downloaded');
  };

  const handleCopyCSV = async () => {
    try {
      await copyCustomerCSVToClipboard(filteredCustomers);
      setCopiedCSV(true);
      toast.success('CSV copied to clipboard');
      setTimeout(() => setCopiedCSV(false), 2000);
    } catch (error) {
      toast.error('Failed to copy CSV');
    }
  };

  const handleOpenSheets = () => {
    if (!sheetsConfig?.sheetUrl) {
      toast.error('Please configure Google Sheets link first');
      setShowSheetsConfig(true);
      return;
    }
    
    window.open(sheetsConfig.sheetUrl, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Customers</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{customers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Search Results</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{filteredCustomers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Google Sheets</p>
                <p className="text-sm font-medium text-slate-100 mt-2">
                  {sheetsConfig ? 'Configured' : 'Not Set'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="glass-card border-slate-800 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card bg-slate-900 border-slate-700 text-slate-100"
              />
            </div>

            {/* Export Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadCSV}
                variant="outline"
                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button
                onClick={handleCopyCSV}
                variant="outline"
                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {copiedCSV ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy CSV
              </Button>
            </div>

            {/* Google Sheets Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSheetsConfig(true)}
                variant="outline"
                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Configure
              </Button>
              <Button
                onClick={handleOpenSheets}
                disabled={!sheetsConfig}
                className="gap-2 gradient-saffron-gold text-white border-0 hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" />
                Open Sheet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="glass-card border-slate-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Users className="h-5 w-5 text-primary" />
            Customer List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="text-slate-500">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'Customer details will appear here when they book'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-900/50">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Phone</TableHead>
                    <TableHead className="text-slate-400">Created</TableHead>
                    <TableHead className="text-slate-400">Updated</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      className="border-slate-800 hover:bg-slate-900/50"
                    >
                      <TableCell className="font-medium text-slate-200">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {customer.phone}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(customer.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleEditClick(customer)}
                            variant="outline"
                            size="sm"
                            className="gap-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirmCustomer(customer)}
                            variant="outline"
                            size="sm"
                            className="gap-1 border-red-900/50 text-red-400 hover:bg-red-950/50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent className="glass-card border-slate-800 shadow-saffron-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Edit Customer</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update customer information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName" className="text-slate-300">Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="glass-card bg-slate-900 border-slate-700 text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone" className="text-slate-300">Phone</Label>
              <Input
                id="editPhone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="glass-card bg-slate-900 border-slate-700 text-slate-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setEditingCustomer(null)}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              className="gradient-saffron-gold text-white border-0 hover:opacity-90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmCustomer} onOpenChange={() => setDeleteConfirmCustomer(null)}>
        <DialogContent className="glass-card border-slate-800 shadow-saffron-lg">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-slate-100 text-center">Delete Customer</DialogTitle>
            <DialogDescription className="text-slate-400 text-center">
              Are you sure you want to delete <strong>{deleteConfirmCustomer?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              onClick={() => setDeleteConfirmCustomer(null)}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Sheets Configuration Dialog */}
      <Dialog open={showSheetsConfig} onOpenChange={setShowSheetsConfig}>
        <DialogContent className="glass-card border-slate-800 shadow-saffron-lg">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full gradient-saffron-gold flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-slate-100 text-center">Configure Google Sheets</DialogTitle>
            <DialogDescription className="text-slate-400 text-center">
              Enter your Google Sheets URL to enable quick access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sheetsUrl" className="text-slate-300">Google Sheets URL</Label>
              <Input
                id="sheetsUrl"
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="glass-card bg-slate-900 border-slate-700 text-slate-100"
              />
              <p className="text-xs text-slate-500">
                Paste the full URL of your Google Sheets document
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowSheetsConfig(false)}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSheetsConfig}
              className="gradient-saffron-gold text-white border-0 hover:opacity-90"
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
