import { useState } from "react";
import { Order, TableStatus } from "@/types";
import { toast } from "sonner";
import { useTableActions } from "./use-tables-data";
import { useOrderActions } from "./use-orders-data";

export function useTableManagement(organizationId: string | undefined) {
  const [updating, setUpdating] = useState(false);
  const { updateTable } = useTableActions(organizationId);
  const { updateOrder } = useOrderActions(organizationId);

  const releaseTable = async (tableId: string, order?: Order) => {
    if (!organizationId) return false;

    setUpdating(true);
    try {
      // Update table status to available
      await updateTable(tableId, {
        status: TableStatus.AVAILABLE,
        updatedAt: new Date(),
      });

      // If there's an order, remove the table assignment
      if (order) {
        await updateOrder(order.id, {
          tableId: undefined,
          tableName: undefined,
          updatedAt: new Date(),
        });
      }

      toast.success("Table released successfully!");
      return true;
    } catch (error) {
      console.error("Error releasing table:", error);
      toast.error("Failed to release table");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const moveOrderToTable = async (
    order: Order, 
    fromTableId: string, 
    toTableId: string,
    toTableName: string
  ) => {
    if (!organizationId) return false;

    setUpdating(true);
    try {
      // Release the source table
      await updateTable(fromTableId, {
        status: TableStatus.AVAILABLE,
        updatedAt: new Date(),
      });

      // Assign order to destination table
      await updateOrder(order.id, {
        tableId: toTableId,
        tableName: toTableName,
        updatedAt: new Date(),
      });

      // Mark destination table as occupied
      await updateTable(toTableId, {
        status: TableStatus.OCCUPIED,
        updatedAt: new Date(),
      });

      toast.success(`Order moved to ${toTableName} successfully!`);
      return true;
    } catch (error) {
      console.error("Error moving order to table:", error);
      toast.error("Failed to move order to table");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    releaseTable,
    moveOrderToTable,
    updating,
  };
}