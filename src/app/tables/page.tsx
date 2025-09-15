'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from '@/hooks/useAuthState';
import { Table as TableType } from '@/types';
import { useTablesData } from '@/hooks/tables/use-tables-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Plus, Trash2, Table as TableIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Search, Users } from 'lucide-react';
import { TableList } from '@/components/TableList';
import { AddTableDialog } from '@/components/AddTableDialog';
import { TableActionsDialog } from '@/components/tables/TableActionsDialog';

export default function TablesPage() {
  const { organizationId } = useAuthState();
  const { tables, loading: tablesLoading } = useTablesData(organizationId || undefined);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(tablesLoading);
  }, [tablesLoading]);

  const handleAddTable = async (table: {
    name: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  }) => {
    if (!organizationId) return;

    await addDoc(collection(db, 'organizations', organizationId, 'tables'), {
      name: table.name,
      capacity: table.capacity,
      status: table.status,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const handleAddMultipleTables = async (tables: Array<{
    name: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  }>) => {
    if (!organizationId) return;

    const promises = tables.map(table =>
      addDoc(collection(db, 'organizations', organizationId, 'tables'), {
        name: table.name,
        capacity: table.capacity,
        status: table.status,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    await Promise.all(promises);
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!organizationId) return;
    await deleteDoc(doc(db, 'organizations', organizationId, 'tables', tableId));
    toast.success('Table deleted successfully');
  };

  const getStatusStats = () => {
    const stats = {
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0,
    };

    tables.forEach((table: TableType) => {
      stats[table.status as keyof typeof stats]++;
    });

    return stats;
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const stats = getStatusStats();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Table Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Reserved</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-gray-600">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <AddTableDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onAddTable={handleAddTable}
          onAddMultipleTables={handleAddMultipleTables}
        />
      </div>

      {/* Tables List */}
      <TableList
        tables={tables}
        searchTerm={searchTerm}
        onDeleteTable={handleDeleteTable}
      />
    </div>
  );
}