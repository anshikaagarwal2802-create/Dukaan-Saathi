import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // ========================
  // STATE SECTION
  // ========================
  const [selectedMonth, setSelectedMonth] = useState("");

  const [entries, setEntries] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const [date, setDate] = useState("");
  const [totalSales, setTotalSales] = useState("");
  const [totalExpenses, setTotalExpenses] = useState("");

  const [product1, setProduct1] = useState("");
  const [qty1, setQty1] = useState("");

  const [product2, setProduct2] = useState("");
  const [qty2, setQty2] = useState("");

  const [product3, setProduct3] = useState("");
  const [qty3, setQty3] = useState("");



  // For storing validation errors
  const [errors, setErrors] = useState({
    product1: false,
    product2: false,
    product3: false,
    message: "",
  });

  // connected react to node 
  useEffect(() => {
    fetch("http://localhost:5000/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error("Error fetching entries:", err));
  }, []);


  // Handle edit - populate form fields with selected entry data
  const handleEdit = (id) => {
    const index = entries.findIndex((e) => e.id === id);
    const entry = entries[index];

    setDate(entry.date);
    setTotalSales(entry.totalSales);
    setTotalExpenses(entry.totalExpenses);

    setProduct1(entry.products[0]?.name || "");
    setQty1(entry.products[0]?.qty || "");

    setProduct2(entry.products[1]?.name || "");
    setQty2(entry.products[1]?.qty || "");

    setProduct3(entry.products[2]?.name || "");
    setQty3(entry.products[2]?.qty || "");

    setEditIndex(index);

    // Clear validation errors on edit
    setErrors({ product1: false, product2: false, product3: false, message: "" });
  };

  // Delete single entry confirmation
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/entries/${id}`, {
        method: "DELETE",
      });

      setEntries(entries.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };



  // Clear all entries confirmation
  const handleClearAll = () => {
    if (!window.confirm("Are you sure you want to delete ALL entries?")) return;
    setEntries([]);
  };

  // Helper to reset validation errors
  const resetErrors = () => {
    setErrors({ product1: false, product2: false, product3: false, message: "" });
  };

  // Real-time validation helper for product names
  // Checks if quantity > 0 and name is either empty or does not contain letters
  const validateProductName = (name, qty, productKey) => {
    if (parseInt(qty, 10) > 0) {
      if (name.trim() === "") {
        setErrors((prev) => ({
          ...prev,
          [productKey]: true,
          message: `Enter name for ${productKey}`,
        }));
      } else if (!/[a-zA-Z]/.test(name)) {
        setErrors((prev) => ({
          ...prev,
          [productKey]: true,
          message: `${productKey} must contain letters`,
        }));
      } else {
        // Clear error for this product if valid
        setErrors((prev) => ({
          ...prev,
          [productKey]: false,
          message: "",
        }));
      }
    } else {
      // If qty is 0 or empty, clear errors for that product
      setErrors((prev) => ({
        ...prev,
        [productKey]: false,
        message: "",
      }));
    }
  };

  // Form submission handler


  const handleSubmit = async (e) => {
    console.log("SUBMIT TRIGGERED");
    e.preventDefault();
    setLoading(true);
    setError("");


    const salesNum = parseFloat(totalSales);
    const expensesNum = parseFloat(totalExpenses);

    if (!date) {
      alert("Please select a date.");
      setLoading(false);
      return;
    }

    if (isNaN(salesNum) || salesNum < 0) {
      alert("Enter valid sales amount.");
      return;
    }

    if (isNaN(expensesNum) || expensesNum < 0) {
      alert("Enter valid expenses amount.");
      setLoading(false);
      return;
    }

    const products = [
      { name: product1.trim(), qty: qty1 === "" ? 0 : parseInt(qty1, 10) },
      { name: product2.trim(), qty: qty2 === "" ? 0 : parseInt(qty2, 10) },
      { name: product3.trim(), qty: qty3 === "" ? 0 : parseInt(qty3, 10) },
    ];

    const profit = salesNum - expensesNum;

    const data = {
      date,
      totalSales: salesNum,
      totalExpenses: expensesNum,
      profit,
      products,
    };

    try {
      if (editIndex !== null) {
        const id = entries[editIndex].id;

        const res = await fetch(`http://localhost:5000/entries/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          throw new Error("Failed to update entry");
        }

        const updatedEntry = await res.json();

        const updatedEntries = [...entries];
        updatedEntries[editIndex] = updatedEntry;
        setEntries(updatedEntries);
        setEditIndex(null);

      } else {
        const res = await fetch("http://localhost:5000/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          throw new Error("Failed to save entry");
        }

        const newEntry = await res.json();
        setEntries([...entries, newEntry]);
        setDate("");
        setTotalSales("");
        setTotalExpenses("");
        setProduct1("");
        setQty1("");
        setProduct2("");
        setQty2("");
        setProduct3("");
        setQty3("");

      }
      

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }



  const filteredEntries = entries
    .filter((entry) =>
      selectedMonth ? entry.date.startsWith(selectedMonth) : true
    )
    .filter((entry) =>
      entry.date.includes(searchText) ||
      entry.products.some((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      )
    );


  const monthlySummary = filteredEntries.reduce(

    (acc, entry) => {
      acc.sales += entry.totalSales;
      acc.expenses += entry.totalExpenses;
      acc.profit += entry.profit;

      entry.products.forEach((p) => {
        if (p.name && p.qty > 0) {
          acc.products[p.name] = (acc.products[p.name] || 0) + p.qty;
        }
      });

      return acc;
    },
    { sales: 0, expenses: 0, profit: 0, products: {} }

  );





  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>DukaanSaathi – Daily Entry</h2>

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>Total Sales (₹)</label>
        <input
          type="number"
          value={totalSales}
          onChange={(e) => setTotalSales(e.target.value)}
        />

        <label>Total Expenses (₹)</label>
        <input
          type="number"
          value={totalExpenses}
          onChange={(e) => setTotalExpenses(e.target.value)}
        />

        <h4>Top Selling Products</h4>

        {/* Product 1 */}
        <div className="products-row">
          <input
            type="text"
            placeholder="Product 1"
            value={product1}
            onChange={(e) => {
              const val = e.target.value;
              setProduct1(val);
              validateProductName(val, qty1, "product1");
            }}
            style={errors.product1 ? { border: "2px solid red" } : {}}
          />
          <input
            type="number"
            placeholder="Qty"
            value={qty1}
            onChange={(e) => {
              const val = e.target.value;
              setQty1(val);
              validateProductName(product1, val, "product1");
            }}
          />
        </div>

        {/* Product 2 */}
        <div className="products-row">
          <input
            type="text"
            placeholder="Product 2"
            value={product2}
            onChange={(e) => {
              const val = e.target.value;
              setProduct2(val);
              validateProductName(val, qty2, "product2");
            }}
            style={errors.product2 ? { border: "2px solid red" } : {}}
          />
          <input
            type="number"
            placeholder="Qty"
            value={qty2}
            onChange={(e) => {
              const val = e.target.value;
              setQty2(val);
              validateProductName(product2, val, "product2");
            }}
          />
        </div>

        {/* Product 3 */}
        <div className="products-row">
          <input
            type="text"
            placeholder="Product 3"
            value={product3}
            onChange={(e) => {
              const val = e.target.value;
              setProduct3(val);
              validateProductName(val, qty3, "product3");
            }}
            style={errors.product3 ? { border: "2px solid red" } : {}}
          />
          <input
            type="number"
            placeholder="Qty"
            value={qty3}
            onChange={(e) => {
              const val = e.target.value;
              setQty3(val);
              validateProductName(product3, val, "product3");
            }}
          />
        </div>

        {/* Show validation error message */}
        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>
            {error}
          </p>
        )}

        {errors.message && (
          <p style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}>
            {errors.message}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Submit"}
        </button>

      </form>

      {/* SUMMARY SECTION */}
      {entries.length > 0 && (
        <div className="summary-container">
          <label>Filter by Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          {selectedMonth && (
            <div className="summary-card">
              <h4>Summary for {selectedMonth}</h4>
              <p>Total Sales: ₹{monthlySummary.sales}</p>
              <p>Total Expenses: ₹{monthlySummary.expenses}</p>
              <p><strong>Total Profit: ₹{monthlySummary.profit}</strong></p>

              <h5>Top Products</h5>
              <ul>
                {Object.entries(monthlySummary.products).map(([name, qty]) => (
                  <li key={name}>
                    {name} – {qty}
                  </li>
                ))}
              </ul>
            </div>
          )}


          <h3>All Entries</h3>
          <input
            type="text"
            placeholder="Search entry (product name or exact date YYYY-MM-DD)"

            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: "15px", width: "100%", padding: "8px" }}
          />


          <button
            onClick={handleClearAll}
            style={{
              backgroundColor: "red",
              color: "white",
              marginBottom: "15px",
              padding: "8px 12px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Clear All Entries
          </button>

          {filteredEntries.map((entry, index) => (
            <div key={entry.id} className="summary-card">
              <h4>{entry.date}</h4>
              <p>Sales: ₹{entry.totalSales}</p>
              <p>Expenses: ₹{entry.totalExpenses}</p>
              <p>
                <strong>Profit: ₹{entry.profit}</strong>
              </p>

              <ul>
                {entry.products
                  .filter((p) => p.name)
                  .map((p, i) => (
                    <li key={i}>
                      {p.name} – {p.qty}
                    </li>
                  ))}
              </ul>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleEdit(entry.id)}>Edit</button>
                <button onClick={() => handleDelete(entry.id)}>Delete</button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

