'use client';

import { useState } from 'react';
import { useTables } from '@/lib/hooks/useTables';
import { TableStatus } from '@/types/enums';
import { Table as TableType } from '@/types';


import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { TableList } from '@/components/TableList';
import { AddTableDialog } from '@/components/AddTableDialog';
import { TableActionsDialog } from '@/components/tables/TableActionsDialog';

export default function TablesPage() {
  const { tables, loading, createTable, deleteTable } = useTables();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  

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
          onAddTable={createTable}
          onAddMultipleTables={async (tables) => {
            try {
              const promises = tables.map(table => createTable(table));
              await Promise.all(promises);
            } catch (error) {
              console.error('Error creating multiple tables:', error);
            }
          }}
        />
      </div>

      {/* Tables List */}
      <TableList
        tables={tables}
        searchTerm={searchTerm}
        onDeleteTable={deleteTable}
      />
    </div>
  );
}