import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import axios from "axios"
import { useParams } from "react-router-dom"

interface Member {
  id: number
  name: string
  avatar: string
  balance?: number
}

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onExpenseAdded: () => void
  groupMembers: Member[]
}

export default function AddExpenseModal({ isOpen, onClose, onExpenseAdded, groupMembers }: AddExpenseModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [splitType, setSplitType] = useState("equal")
  const [selectedPayers, setSelectedPayers] = useState<{ [key: number]: number }>({})
  const [selectedSplitters, setSelectedSplitters] = useState<number[]>([])
  const [customSplits, setCustomSplits] = useState<{ [key: number]: number }>({})
  const [customAmounts, setCustomAmounts] = useState<{ [key: number]: number }>({})

  const { id } = useParams();
  const groupId = Number(id);

  if (!isOpen) return null

  const handlePayerAmountChange = (userId: number, amount: string) => {
    const numAmount = Number.parseFloat(amount) || 0
    setSelectedPayers((prev) => ({
      ...prev,
      [userId]: numAmount,
    }))
  }

  const handleSplitterToggle = (userId: number) => {
    setSelectedSplitters((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCustomSplitChange = (userId: number, percentage: string) => {
    const numPercentage = Number.parseFloat(percentage) || 0
    setCustomSplits((prev) => ({
      ...prev,
      [userId]: numPercentage,
    }))
  }

  const handleCustomAmountChange = (userId: number, amount: string) => {
    const numAmount = Number.parseFloat(amount) || 0
    setCustomAmounts((prev) => ({
      ...prev,
      [userId]: numAmount,
    }))
  }

  const totalPaid = Object.values(selectedPayers).reduce((sum, amount) => sum + amount, 0)
  const totalSplitPercentage = Object.values(customSplits).reduce((sum, percentage) => sum + percentage, 0)
  const totalSplitAmount = Object.values(customAmounts).reduce((sum, amount) => sum + amount, 0)
  const isValidSplit =
    splitType === "equal" ||
    (splitType === "percentage" && Math.abs(totalSplitPercentage - 100) < 0.01) ||
    (splitType === "amount" && Math.abs(totalSplitAmount - Number.parseFloat(totalAmount || "0")) < 0.01)

    const addExpense = async (groupId: number, expenseData: any) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/groups/${groupId}/expenses`, expenseData);
            console.log("Expense added:", response.data);
            return response.data;
        } catch (err) {
            console.error("Error adding expense:", err);
        }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !totalAmount || totalPaid !== Number.parseFloat(totalAmount) || !isValidSplit) {
      return
    }

    const payload = {
        title,
        description,
        totalAmount: parseFloat(totalAmount),
        payers: Object.entries(selectedPayers).map(([userId, amount]) => ({
          userId: Number(userId),
          amountPaid: amount,
        })),
        splitters: selectedSplitters,
        splitType,
        customSplits:
          splitType === "percentage"
            ? Object.entries(customSplits).map(([userId, percentage]) => ({
                userId: Number(userId),
                percentage: percentage,
              }))
            : undefined,
        customAmounts:
          splitType === "amount"
            ? Object.entries(customAmounts).map(([userId, amount]) => ({
                userId: Number(userId),
                amount: amount,
              }))
            : undefined,
      };

      await addExpense(groupId, payload);
      onExpenseAdded();

    // Reset form and close
    setTitle("")
    setDescription("")
    setTotalAmount("")
    setSelectedPayers({})
    setSelectedSplitters([])
    setCustomSplits({})
    setCustomAmounts({})
    setSplitType("equal")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Expense</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Expense Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter expense title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter expense description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="amount">Total Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <Separator />

          {/* Who Paid */}
          <div>
            <h3 className="text-lg font-medium mb-4">Who Paid?</h3>
            <div className="space-y-3">
              {groupMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1">{member.name}</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-24"
                    value={selectedPayers[member.id] || ""}
                    onChange={(e) => handlePayerAmountChange(member.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span>Total Paid: ${totalPaid.toFixed(2)}</span>
              <span className={totalPaid === Number.parseFloat(totalAmount || "0") ? "text-green-600" : "text-red-600"}>
                {totalPaid === Number.parseFloat(totalAmount || "0") ? "✓ Matches total" : "⚠ Doesn't match total"}
              </span>
            </div>
          </div>

          <Separator />

          {/* Split Among */}
          <div>
            <h3 className="text-lg font-medium mb-4">Split Among</h3>
            <div className="space-y-3 mb-4">
              {groupMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedSplitters.includes(member.id)}
                    onCheckedChange={() => handleSplitterToggle(member.id)}
                  />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>{member.name.split(" ").map((n) => n[0])}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1">{member.name}</span>
                </div>
              ))}
            </div>

            {/* Split Type */}
            <RadioGroup value={splitType} onValueChange={setSplitType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal" id="equal" />
                <Label htmlFor="equal">Split Equally</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Split by Percentage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="amount" id="amount" />
                <Label htmlFor="amount">Split by Amount</Label>
              </div>
            </RadioGroup>

            {/* Custom Split Percentages */}
            {splitType === "percentage" && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium">Set Percentages</h4>
                {selectedSplitters.map((userId) => {
                  const member = groupMembers.find((m) => m.id === userId)
                  if (!member) return null

                  return (
                    <div key={userId} className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{member.name}</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        className="w-20"
                        value={customSplits[userId] || ""}
                        onChange={(e) => handleCustomSplitChange(userId, e.target.value)}
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  )
                })}
                <div className="text-sm">
                  <span className={totalSplitPercentage === 100 ? "text-green-600" : "text-red-600"}>
                    Total: {totalSplitPercentage.toFixed(1)}%
                    {totalSplitPercentage === 100 ? " ✓" : " (must equal 100%)"}
                  </span>
                </div>
              </div>
            )}

            {/* Custom Split Amounts */}
            {splitType === "amount" && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium">Set Amounts</h4>
                {selectedSplitters.map((userId) => {
                  const member = groupMembers.find((m) => m.id === userId)
                  if (!member) return null

                  return (
                    <div key={userId} className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{member.name}</span>
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-24"
                        value={customAmounts[userId] || ""}
                        onChange={(e) => handleCustomAmountChange(userId, e.target.value)}
                      />
                    </div>
                  )
                })}
                <div className="text-sm">
                  <span
                    className={
                      Math.abs(totalSplitAmount - Number.parseFloat(totalAmount || "0")) < 0.01
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    Total: ${totalSplitAmount.toFixed(2)}
                    {Math.abs(totalSplitAmount - Number.parseFloat(totalAmount || "0")) < 0.01
                      ? " ✓"
                      : ` (must equal $${totalAmount || "0.00"})`}
                  </span>
                </div>
              </div>
            )}

            {/* Equal Split Preview */}
            {splitType === "equal" && selectedSplitters.length > 0 && totalAmount && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Split Preview</h4>
                <div className="text-sm text-gray-600">
                  Each person pays: ${(Number.parseFloat(totalAmount) / selectedSplitters.length).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !title ||
                !totalAmount ||
                totalPaid !== Number.parseFloat(totalAmount || "0") ||
                !isValidSplit ||
                selectedSplitters.length === 0
              }
            >
              Add Expense
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
