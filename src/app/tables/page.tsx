'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Table } from '@/types';
import { useTablesData } from '@/hooks/use-tables-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';
import { TableList } from '@/components/TableList';
import { AddTableDialog } from '@/components/AddTableDialog';

export default function TablesPage() {
  const { organizationId } = useAuth();
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
    if (confirm('Are you sure you want to delete this table?')) {
      await deleteDoc(doc(db, 'organizations', organizationId, 'tables', tableId));
    }
  };

  const getStatusStats = () => {
    const stats = {
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0,
    };

    tables.forEach(table => {
      stats[table.status]++;
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