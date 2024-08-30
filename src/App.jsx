import React, { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  Users,
  DollarSign,
  Menu,
  UserPlus,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import useCheckTransaction from "./CheckTransaction";

const LitePay = () => {
  const [activeTab, setActiveTab] = useState("groups");
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splits: {},
  });
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState({});
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentAddress, setPaymentAddress] = useState("");

  const {
    txId,
    setTxId,
    txInfo,
    error,
    loading,
    checkAmount,
    setCheckAmount,
    paymentStatus,
    fetchTransactionInfo,
  } = useCheckTransaction();

  const hasRestored = useRef(false);
  useEffect(() => {
    if (hasRestored.current === false) {
      const storedGroups = localStorage.getItem("litepay-groups");
      const storedExpenses = localStorage.getItem("litepay-expenses");
      const storedMembers = localStorage.getItem("litepay-members");

      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      }
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
      if (storedMembers) {
        setMembers(JSON.parse(storedMembers));
      }
      hasRestored.current = true;
    }
  }, []);

  useEffect(() => {
    if (hasRestored.current) {
      localStorage.setItem("litepay-groups", JSON.stringify(groups));
      localStorage.setItem("litepay-expenses", JSON.stringify(expenses));
      localStorage.setItem("litepay-members", JSON.stringify(members));
    }
  }, [groups, expenses, members]);

  const addGroup = () => {
    if (newGroupName.trim()) {
      const updatedGroups = [
        ...groups,
        { name: newGroupName.trim(), members: [], expenses: [] },
      ];
      setGroups(updatedGroups);
      setNewGroupName("");
    }
  };

  const selectGroup = (group) => {
    setSelectedGroup(group);
    setActiveTab("groupDetails");
  };

  const addMember = () => {
    if (newMemberName.trim() && selectedGroup) {
      const updatedGroups = groups.map((group) =>
        group === selectedGroup
          ? {
              ...group,
              members: [...new Set([...group.members, newMemberName.trim()])],
            }
          : group
      );
      setGroups(updatedGroups);
      setSelectedGroup({
        ...selectedGroup,
        members: [...new Set([...selectedGroup.members, newMemberName.trim()])],
      });
      setNewMemberName("");
    }
  };

  const addExpense = () => {
    if (
      newExpense.description &&
      newExpense.amount &&
      newExpense.paidBy &&
      selectedGroup
    ) {
      const expense = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        splits: Object.fromEntries(
          Object.entries(newExpense.splits).map(([member, share]) => [
            member,
            parseFloat(share),
          ])
        ),
      };
      const updatedGroups = groups.map((group) =>
        group === selectedGroup
          ? { ...group, expenses: [...group.expenses, expense] }
          : group
      );
      setGroups(updatedGroups);
      setSelectedGroup({
        ...selectedGroup,
        expenses: [...selectedGroup.expenses, expense],
      });
      setNewExpense({ description: "", amount: "", paidBy: "", splits: {} });
      setPaymentAmount(expense.amount.toFixed(2));
      setIsPaymentModalVisible(true);
    }
  };

  const updateExpenseSplit = (member, share) => {
    setNewExpense((prev) => ({
      ...prev,
      splits: { ...prev.splits, [member]: share },
    }));
  };

  const removeMember = (memberToRemove) => {
    if (selectedGroup) {
      const updatedGroups = groups.map((group) =>
        group === selectedGroup
          ? {
              ...group,
              members: group.members.filter(
                (member) => member !== memberToRemove
              ),
            }
          : group
      );
      setGroups(updatedGroups);
      setSelectedGroup({
        ...selectedGroup,
        members: selectedGroup.members.filter(
          (member) => member !== memberToRemove
        ),
      });
    }
  };

  const removeGroup = (groupToRemove) => {
    const updatedGroups = groups.filter((group) => group !== groupToRemove);
    setGroups(updatedGroups);
    if (selectedGroup === groupToRemove) {
      setSelectedGroup(null);
      setActiveTab("groups");
    }
  };

  const verifyPayment = async () => {
    await fetchTransactionInfo();
  };

  const generatePaymentAddress = () => {
    // In a real application, this would generate a unique payment address
    // For this example, we'll use a placeholder
    setPaymentAddress("Lxyz123...abc789");
  };

  useEffect(() => {
    const calculateBalances = () => {
      const balances = {};
      if (selectedGroup) {
        for (const expense of selectedGroup.expenses) {
          const { paidBy, splits, amount } = expense;
          balances[paidBy] = (balances[paidBy] || 0) + amount;
          for (const [member, share] of Object.entries(splits)) {
            balances[member] = (balances[member] || 0) - share;
          }
        }
      }
      setBalances(balances);
    };

    calculateBalances();
  }, [selectedGroup]);

  const Header = () => (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">LitePay</h1>
      {activeTab === "groupDetails" && (
        <button onClick={() => setActiveTab("groups")} className="text-white">
          <ArrowLeft size={24} />
        </button>
      )}
    </header>
  );

  const Footer = () => (
    <footer className="bg-gray-800 text-center p-4 text-sm text-gray-400 shadow-inner">
      © 2024 LitePay. All rights reserved.
    </footer>
  );

  const PaymentModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Make Payment</h2>
        <p className="mb-4">Amount to pay: Ł{paymentAmount}</p>
        {!paymentAddress ? (
          <button
            className="w-full bg-blue-600 text-white p-3 rounded-lg shadow-sm hover:bg-blue-700 transition duration-200"
            onClick={generatePaymentAddress}
          >
            Generate Payment Address
          </button>
        ) : (
          <>
            <p className="mb-4">Payment Address: {paymentAddress}</p>
            <input
              type="text"
              placeholder="Transaction ID"
              className="w-full p-3 mb-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
            />
            <button
              className="w-full bg-green-600 text-white p-3 rounded-lg shadow-sm hover:bg-green-700 transition duration-200"
              onClick={verifyPayment}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Payment"}
            </button>
          </>
        )}
        {error && <p className="text-red-400 mt-3">{error}</p>}
        {paymentStatus && (
          <p className="mt-3">
            Payment Status:{" "}
            <span
              className={
                paymentStatus === "Paid" ? "text-green-400" : "text-red-400"
              }
            >
              {paymentStatus}
            </span>
          </p>
        )}
        <button
          className="mt-4 w-full bg-red-600 text-white p-3 rounded-lg shadow-sm hover:bg-red-700 transition duration-200"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        {activeTab === "groups" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Your Groups</h2>
            <div className="mb-6">
              <input
                type="text"
                placeholder="New group name"
                className="w-full p-3 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <button
                className="mt-3 w-full bg-blue-600 text-white p-3 rounded-lg shadow-sm hover:bg-blue-700 transition duration-200"
                onClick={addGroup}
              >
                <PlusCircle className="inline-block mr-2" size={18} />
                Create New Group
              </button>
            </div>
            <ul className="space-y-3">
              {groups.map((group, index) => (
                <li
                  key={index}
                  className="bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition duration-200"
                >
                  <span className="font-medium">{group.name}</span>
                  <div className="flex items-center">
                    <button
                      onClick={() => selectGroup(group)}
                      className="text-blue-400 hover:text-blue-600 mr-2"
                    >
                      <Menu size={18} />
                    </button>
                    <button
                      onClick={() => removeGroup(group)}
                      className="text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "groupDetails" && selectedGroup && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              {selectedGroup.name}
            </h2>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Members</h3>
              <ul className="mb-4 space-y-2">
                {selectedGroup.members.map((member, index) => (
                  <li
                    key={index}
                    className="bg-gray-800 p-3 rounded-lg shadow-sm flex justify-between items-center"
                  >
                    {member}
                    <button
                      onClick={() => removeMember(member)}
                      className="text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex">
                <input
                  type="text"
                  placeholder="New member name"
                  className="flex-grow p-3 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <button
                  className="bg-green-500 text-white p-3 rounded-r-lg hover:bg-green-600 transition duration-200"
                  onClick={addMember}
                >
                  <UserPlus size={18} />
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Expenses</h3>
              {selectedGroup.expenses.map((expense, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-4 rounded-lg shadow-sm mb-3"
                >
                  <p className="font-medium">{expense.description}</p>
                  <p>
                    Amount: Ł{expense.amount.toFixed(2)} - Paid by:{" "}
                    {expense.paidBy}
                  </p>
                  <div className="mt-2 text-sm text-gray-400">
                    <p>Split:</p>
                    {Object.entries(expense.splits).map(
                      ([member, share], i) => (
                        <p key={i}>
                          {member}: Ł{share.toFixed(2)}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
              <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold mb-3">Add New Expense</h4>
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full p-3 mb-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full p-3 mb-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                />
                <select
                  className="w-full p-3 mb-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                  value={newExpense.paidBy}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, paidBy: e.target.value })
                  }
                >
                  <option value="">Paid By</option>
                  {selectedGroup.members.map((member, index) => (
                    <option key={index} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
                {selectedGroup.members.map((member, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <span className="flex-grow">{member}</span>
                    <input
                      type="number"
                      placeholder={`Share for ${member}`}
                      className="w-20 p-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                      value={newExpense.splits[member] || ""}
                      onChange={(e) =>
                        updateExpenseSplit(member, e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg shadow-sm hover:bg-blue-700 transition duration-200"
                  onClick={addExpense}
                >
                  <CreditCard className="inline-block mr-2" size={18} />
                  Add Expense
                </button>
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Balances</h3>
              <ul>
                {Object.entries(balances).map(([member, balance], index) => (
                  <li
                    key={index}
                    className="bg-gray-800 p-3 rounded-lg shadow-sm mb-2"
                  >
                    {member}: {balance >= 0 ? "+" : "-"}Ł
                    {Math.abs(balance).toFixed(2)}
                  </li>
                ))}
              </ul>
              <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold mb-3">Verify Payment</h4>
                <input
                  type="text"
                  placeholder="Transaction ID"
                  className="w-full p-3 mb-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Enter Amount to Check"
                  className="w-full p-3 mb-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
                  value={checkAmount}
                  onChange={(e) => setCheckAmount(e.target.value)}
                />
                <button
                  className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg shadow-sm hover:bg-blue-700 transition duration-200"
                  onClick={verifyPayment}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Verify Payment"}
                </button>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {paymentStatus && (
                  <p className="mt-3">
                    Payment Status:{" "}
                    <span
                      className={
                        paymentStatus === "Paid"
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {paymentStatus}
                    </span>
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />

      {isPaymentModalVisible && (
        <PaymentModal
          onClose={() => setIsPaymentModalVisible(false)}
          onVerify={verifyPayment}
        />
      )}
    </div>
  );
};

export default LitePay;
