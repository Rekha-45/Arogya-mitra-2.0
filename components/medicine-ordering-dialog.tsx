"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Trash2, Package } from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface MedicineOrderingDialogProps {
  children: React.ReactNode
}

interface CartItem {
  name: string
  dosage: string
  quantity: number
  price: number
}

export function MedicineOrderingDialog({ children }: MedicineOrderingDialogProps) {
  const { user, addMedicineOrder } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("order")
  const [cart, setCart] = useState<CartItem[]>([])
  const [pharmacy, setPharmacy] = useState("")
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    quantity: 1,
    price: 0,
  })

  const suggestedMedicines = user?.currentMedications || []

  const handleAddToCart = () => {
    if (!newMedicine.name || !newMedicine.dosage) {
      alert("Please fill in medicine name and dosage")
      return
    }

    const existingItem = cart.find((item) => item.name === newMedicine.name && item.dosage === newMedicine.dosage)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.name === newMedicine.name && item.dosage === newMedicine.dosage
            ? { ...item, quantity: item.quantity + newMedicine.quantity }
            : item,
        ),
      )
    } else {
      setCart([...cart, newMedicine])
    }

    setNewMedicine({ name: "", dosage: "", quantity: 1, price: 0 })
  }

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const handlePlaceOrder = () => {
    if (cart.length === 0 || !pharmacy) {
      alert("Please add medicines and select a pharmacy")
      return
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    addMedicineOrder({
      medicines: cart.map((item) => ({
        name: item.name,
        dosage: item.dosage,
        quantity: item.quantity,
      })),
      pharmacy,
      status: "pending",
      totalPrice,
    })

    alert("Order placed successfully! Expected delivery: 2-3 business days")
    setCart([])
    setPharmacy("")
    setActiveTab("orders")
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <ShoppingCart className="w-5 h-5" />
            Order Medicines Online
          </DialogTitle>
          <DialogDescription>Order medicines from your prescriptions and have them delivered</DialogDescription>
        </DialogHeader>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "order" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("order")}
            className="flex-1"
          >
            Place Order
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("orders")}
            className="flex-1"
          >
            My Orders
          </Button>
        </div>

        <div className="space-y-6">
          {activeTab === "order" && (
            <>
              {/* Suggested Medicines */}
              {suggestedMedicines.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">From Your Prescriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {suggestedMedicines.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{med.name}</p>
                          <p className="text-xs text-gray-600">{med.dosage}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setNewMedicine({
                              name: med.name,
                              dosage: med.dosage,
                              quantity: 30,
                              price: 15,
                            })
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Add Medicine Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Medicine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicineName">Medicine Name</Label>
                      <Input
                        id="medicineName"
                        value={newMedicine.name}
                        onChange={(e) => setNewMedicine((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g., Aspirin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={newMedicine.dosage}
                        onChange={(e) => setNewMedicine((p) => ({ ...p, dosage: e.target.value }))}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={newMedicine.quantity}
                        onChange={(e) =>
                          setNewMedicine((p) => ({ ...p, quantity: Number.parseInt(e.target.value) || 1 }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per unit ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newMedicine.price}
                        onChange={(e) =>
                          setNewMedicine((p) => ({ ...p, price: Number.parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddToCart} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>

              {/* Shopping Cart */}
              {cart.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Shopping Cart ({cart.length} items)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.dosage} • Qty: {item.quantity} • ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pharmacy">Select Pharmacy</Label>
                        <select
                          id="pharmacy"
                          value={pharmacy}
                          onChange={(e) => setPharmacy(e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Choose a pharmacy...</option>
                          <option value="Care Pharmacy Plus">Care Pharmacy Plus</option>
                          <option value="Health Mart Pharmacy">Health Mart Pharmacy</option>
                          <option value="Quick Meds Pharmacy">Quick Meds Pharmacy (24/7)</option>
                        </select>
                      </div>

                      <Button onClick={handlePlaceOrder} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Place Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {(user?.medicineOrders || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No medicine orders yet</p>
                </div>
              ) : (
                (user?.medicineOrders || []).map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{order.pharmacy}</CardTitle>
                          <CardDescription>{new Date(order.date).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge
                          className={
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        {order.medicines.map((med, idx) => (
                          <p key={idx} className="text-sm text-gray-700">
                            {med.name} - {med.dosage} × {med.quantity}
                          </p>
                        ))}
                      </div>
                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">${order.totalPrice.toFixed(2)}</span>
                      </div>
                      {order.deliveryDate && (
                        <p className="text-sm text-gray-600">
                          Delivered: {new Date(order.deliveryDate).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
