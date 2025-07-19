import { useEffect, useState } from "react"
import { ArrowLeft, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AddExpenseModal from "@/components/addExpenseModal"
import AddSettlementModal from "@/components/addSettlementModal"
import { Link, useParams } from "react-router-dom"
import axios from "axios"

export interface GroupDetails {
    id: number;
    name: string;
    description: string;
    members: Member[];
    expenses: Expense[];
    settlements: Settlement[];
  }
  
  export interface Member {
    id: number;
    name: string;
    avatar: string;
    balance: number;
  }
  
  export interface Expense {
    id: number;
    title: string;
    description: string;
    date: string;          
    totalAmount: number;
    paidBy: Payer[];
    splitAmong: Split[];
  }
  
  export interface Payer {
    userId: number;
    amount: number;
  }
  
  export interface Split {
    userId: number;
    share: number;
    paid: number;
    owes: number;
  }
  
  export interface Settlement {
    id: number;
    date: string;
    from: SettlementUser;
    to: SettlementUser;
    amount: number;
    description: string;
  }
  
  export interface SettlementUser {
    userId: number;
    name: string;
  }
  

export default function GroupPage() {
  const [expandedExpense, setExpandedExpense] = useState<number | null>(null)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddSettlement, setShowAddSettlement] = useState(false)
  const [groupData, setGroupData] = useState<GroupDetails>()

  const { id } = useParams();
  const groupId = Number(id);

  const fetchGroupData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/groups/${groupId}`);
      setGroupData(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleExpenseAdded = () => {
    fetchGroupData();
  };

  const handleSettlementAdded = () => {
    fetchGroupData();
  };

  const group = groupData

  if (!group) {
    return <div>Group not found</div>
  }

  const toggleExpenseDetails = (expenseId: number) => {
    setExpandedExpense(expandedExpense === expenseId ? null : expenseId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/home" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </Link>
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900">deben</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          <p className="mt-2 text-gray-600">{group.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Expenses */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Expenses</h2>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowAddSettlement(true)}>
                  Record Settlement
                </Button>
                <Button onClick={() => setShowAddExpense(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </div>

            {/* Settlement Transactions */}
            {group.settlements.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Settlements</h3>
                {group.settlements.map((settlement) => (
                  <Card key={settlement.id} className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Settlement
                          </Badge>
                          <span className="text-sm text-gray-600">{settlement.date}</span>
                        </div>
                        <span className="font-semibold text-green-600">${settlement.amount.toFixed(2)}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        {settlement.from.name} paid {settlement.to.name}
                      </p>
                      {settlement.description && <p className="text-xs text-gray-500 mt-1">{settlement.description}</p>}
                    </CardContent>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Expenses List */}
            <div className="space-y-4">
              {group.expenses.map((expense) => (
                <Card key={expense.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpenseDetails(expense.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{expense.title}</h3>
                            {expandedExpense === expense.id ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{expense.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">{expense.date}</span>
                            <span className="text-sm text-gray-500">
                              Paid by:{" "}
                              {expense.paidBy
                                .map((p) => {
                                  const user = group.members.find((m) => m.id === p.userId)
                                  return user?.name
                                })
                                .join(", ")}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-semibold text-gray-900">${expense.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedExpense === expense.id && (
                      <div className="border-t bg-gray-50 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Who Paid</h4>
                            <div className="space-y-2">
                              {expense.paidBy.map((payment) => {
                                const user = group.members.find((m) => m.id === payment.userId)
                                return (
                                  <div key={payment.userId} className="flex justify-between">
                                    <span className="text-gray-700">{user?.name}</span>
                                    <span className="font-medium">${payment.amount.toFixed(2)}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Split Details</h4>
                            <div className="space-y-2">
                              {expense.splitAmong.map((split) => {
                                const user = group.members.find((m) => m.id === split.userId)
                                const balance = split.paid - split.share
                                return (
                                  <div key={split.userId} className="flex justify-between items-center">
                                    <span className="text-gray-700">{user?.name}</span>
                                    <div className="text-right">
                                      <div className="text-sm text-gray-500">Share: ${split.share.toFixed(2)}</div>
                                      {balance > 0 && (
                                        <div className="text-sm text-green-600">Gets back: ${balance.toFixed(2)}</div>
                                      )}
                                      {balance < 0 && (
                                        <div className="text-sm text-red-600">
                                          Owes: ${Math.abs(balance).toFixed(2)}
                                        </div>
                                      )}
                                      {balance === 0 && <div className="text-sm text-gray-500">Settled</div>}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar - Group Members */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
                <CardDescription>
                  {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                    <div className="text-right">
                      {member.balance > 0 && (
                        <span className="text-sm font-medium text-green-600">+${member.balance.toFixed(2)}</span>
                      )}
                      {member.balance < 0 && (
                        <span className="text-sm font-medium text-red-600">${member.balance.toFixed(2)}</span>
                      )}
                      {member.balance === 0 && <span className="text-sm text-gray-500">Settled</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddExpenseModal 
        isOpen={showAddExpense} 
        onClose={() => setShowAddExpense(false)} 
        onExpenseAdded={handleExpenseAdded}
        groupMembers={group.members} 
      />
      <AddSettlementModal
        isOpen={showAddSettlement}
        onClose={() => setShowAddSettlement(false)}
        onSettlementAdded={handleSettlementAdded}
        groupMembers={group.members}
      />
    </div>
  )
}