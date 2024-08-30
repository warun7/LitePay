import { useState } from "react";

const API_BASE_URL = "https://chainz.cryptoid.info/ltc/api.dws";

const useCheckTransaction = () => {
  const [txId, setTxId] = useState("");
  const [txInfo, setTxInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkAmount, setCheckAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);

  const fetchTransactionInfo = async () => {
    setLoading(true);
    setError("");
    setTxInfo(null);
    setPaymentStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}?q=txinfo&t=${txId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transaction info");
      }
      const data = await response.json();
      setTxInfo(data);
      checkPaymentStatus(data);
    } catch (err) {
      setError(
        "Error fetching transaction info. Please check the transaction ID and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = (data) => {
    if (!checkAmount) {
      setPaymentStatus(null);
      return;
    }

    const expectedAmount = parseFloat(checkAmount);
    const matchingInput = data.inputs.find(
      (input) => parseFloat(input.amount) === expectedAmount
    );

    setPaymentStatus(matchingInput ? "Paid" : "Not Paid");
  };

  return {
    txId,
    setTxId,
    txInfo,
    error,
    loading,
    checkAmount,
    setCheckAmount,
    paymentStatus,
    fetchTransactionInfo,
  };
};

export default useCheckTransaction;
