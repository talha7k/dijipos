'use client';

import { Table } from '@/types';
import { useOrganizationId, useUser, useSelectedOrganization } from '@/hooks/useAuthState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table as TableIcon, Plus, Trash2, Users, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableActionsDialog } from '@/components/tables/TableActionsDialog';
import { useTableManagement } from '@/hooks/tables/use-table-management';

interface TablesTabProps {
  tables: Table[];
}

export function TablesTab({ tables }: TablesTabProps) {
  const organizationId = useOrganizationId();
  const {
    dialogOpen,
    setDialogOpen,
    deleteTableId,
    setDeleteTableId,
    newTable,
    setNewTable,
    handleAddTable,
    handleDeleteTable,
    confirmDeleteTable,
    getStatusColor,
  } = useTableManagement(organizationId || undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Tables
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="table-name">Name</Label>
                  <Input
                    id="table-name"
                    placeholder="e.g., Table 1, Booth A"
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="table-capacity">Capacity</Label>
                  <Input
                    id="table-capacity"
                    type="number"
                    min="1"
                    placeholder="4"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="table-status">Status</Label>
                  <Select
                    value={newTable.status}
                    onValueChange={(value: 'available' | 'occupied' | 'reserved' | 'maintenance') =>
                      setNewTable({ ...newTable, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
<Button onClick={() => handleAddTable()} className="w-full">
                    Add Table
                  </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tables.length === 0 ? (
          <p className="text-muted-foreground">No tables added yet.</p>
        ) : (
          <div className="grid gap-2">
            {tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <TableIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{table.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{table.capacity} seats</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(table.status)}>
                    {table.status}
                  </Badge>
                  <TableActionsDialog table={table}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-accent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableActionsDialog>
                  <AlertDialog open={deleteTableId === table.id} onOpenChange={(open) => !open && setDeleteTableId(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTable(table.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the table &ldquo;{table.name}&rdquo;. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteTableId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirmDeleteTable()} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}