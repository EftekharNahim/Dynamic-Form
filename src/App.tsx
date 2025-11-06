import { useEffect, useState } from "react";
import "./App.css";
import type {FormData} from '../utilities/types'
import DynamicForm from "./DynamicForm/DynamicForm";
function App() {
  // const [count, setCount] = useState(0);
  // const [title, setTitle] = useState("");
  const [formData, setFormData] = useState<FormData|null>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => { setFormData(data);  console.log(formData);});
   
  }, []);
  if(!formData)return <p>Loading...</p>;
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="flex justify-center pb-5 font-bold">{formData.title}</h1>
        <DynamicForm formData={formData}/>
      </div>
    </div>
  )
}

export default App;
