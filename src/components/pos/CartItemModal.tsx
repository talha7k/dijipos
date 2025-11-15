'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ProductVariation } from '@/types';

interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  total: number;
  variations?: ProductVariation[]; // For when variations are available
  selectedVariationId?: string; // Selected variation ID
}

interface CartItemModalProps {
  item: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onDeleteItem: (itemId: string) => void;
}

export function CartItemModal({
  item,
  isOpen,
  onClose,
  onUpdateQuantity,
  onDeleteItem
}: CartItemModalProps) {
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [selectedVariationId, setSelectedVariationId] = useState(item?.selectedVariationId || '');



  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleSave = () => {
    if (item) {
      onUpdateQuantity(item.id, quantity);
      onClose();
    }
  };

  const handleDelete = () => {
    if (item) {
      onDeleteItem(item.id);
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Quantity Controls */}
          <div className="space-y-3 mt-3 mb-4">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="default"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="h-10 w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-20 h-10 text-center"
              />

              <Button
                variant="outline"
                size="default"
                onClick={() => handleQuantityChange(quantity + 1)}
                className="h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Item Variations Section - Takes remaining height */}
          <div className="flex-1 flex flex-col min-h-40">
            <Label className="mb-3">Variations</Label>
            {item?.variations && item.variations.length > 0 ? (
              <div className="flex-1 overflow-auto">
                <RadioGroup
                  value={selectedVariationId}
                  onValueChange={setSelectedVariationId}
                  className="space-y-2 pr-2"
                >
                  {item.variations.map((variation) => (
                    <div key={variation.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-muted/50">
                      <RadioGroupItem value={variation.id} id={variation.id} />
                      <Label htmlFor={variation.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{variation.name}</div>
                            {variation.description && (
                              <div className="text-sm text-muted-foreground">{variation.description}</div>
                            )}
                          </div>
                          <div className="font-medium">
                            ${variation.price.toFixed(2)}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded w-full text-center">
                  No variations available for this item
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 mt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Item
            </Button>
            <Button onClick={handleSave} className="flex-3">
              Update Quantity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}