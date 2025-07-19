import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"
import { useParams } from "react-router-dom"

interface Member {
  id: number
  name: string
  avatar: string
  balance?: number
}

interface AddSettlementModalProps {
  isOpen: boolean
  onClose: () => void
  onSettlementAdded: () => void
  groupMembers: Member[]
}

export default function AddSettlementModal({ isOpen, onClose, onSettlementAdded, groupMembers }: AddSettlementModalProps) {
  const [fromUserId, setFromUserId] = useState("")
  const [toUserId, setToUserId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const { id } = useParams();
  const groupId = Number(id);

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromUserId || !toUserId || !amount || fromUserId === toUserId) {
      return
    }

    const payload = {
        fromUserId: Number.parseInt(fromUserId),
        toUserId: Number.parseInt(toUserId),
        amount: Number.parseFloat(amount),
        description,
        date: new Date().toISOString().split("T")[0],
      };
      
      try {
        const response = await axios.post(`http://localhost:8080/api/groups/${groupId}/expenses/settlements`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("Settlement saved:", response.data);
        onSettlementAdded();
      } catch (error: any) {
        console.error("Failed to save settlement:", error.response?.data || error.message);
      }

    // Reset form and close
    setFromUserId("")
    setToUserId("")
    setAmount("")
    setDescription("")
    onClose()
  }

  // Get members who owe money (negative balance) for "from" dropdown
  const membersWhoOwe = groupMembers.filter((member) => (member.balance || 0) < 0)

  // Get members who are owed money (positive balance) for "to" dropdown
  const membersOwed = groupMembers.filter((member) => (member.balance || 0) > 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Record Settlement</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="from">Who is paying? *</Label>
            <Select value={fromUserId} onValueChange={setFromUserId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select person paying" />
              </SelectTrigger>
              <SelectContent>
                {groupMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                      {member.balance && member.balance < 0 && (
                        <span className="text-xs text-red-600 ml-auto">
                          (owes ${Math.abs(member.balance).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="to">Who is receiving payment? *</Label>
            <Select value={toUserId} onValueChange={setToUserId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select person receiving" />
              </SelectTrigger>
              <SelectContent>
                {groupMembers
                  .filter((member) => member.id.toString() !== fromUserId)
                  .map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                        {member.balance && member.balance > 0 && (
                          <span className="text-xs text-green-600 ml-auto">(owed ${member.balance.toFixed(2)})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note about this settlement"
              rows={3}
            />
          </div>

          {/* Settlement Preview */}
          {fromUserId && toUserId && amount && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Settlement Preview:</strong>
                <br />
                {groupMembers.find((m) => m.id === Number.parseInt(fromUserId))?.name} will pay{" "}
                {groupMembers.find((m) => m.id === Number.parseInt(toUserId))?.name}{" "}
                <strong>${Number.parseFloat(amount || "0").toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!fromUserId || !toUserId || !amount || fromUserId === toUserId}>
              Record Settlement
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}