"use client"

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { CloudUpload } from "lucide-react"; // Ícone de upload

export default function SorteioExcel() {
  const [data, setData] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name); // Salva o nome do arquivo para exibir

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const binaryString = e.target?.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);
    };
  };

  const handleSorteio = () => {
    if (data.length === 0) return;

    const pendenteItems = data.filter(item => item["Serial"] === "PENDENTE");
    const normalItems = data.filter(item => item["Serial"] != "PENDENTE");

    // Calcular a quantidade mínima de itens com cota (20%)
    const minPendenteCount = Math.floor(quantidade * 0.2);
    const pendenteToSelect = Math.min(minPendenteCount, pendenteItems.length);

    // Garantir que pelo menos `minPendenteCount` itens "PENDENTE" sejam sorteados
    let selectedItems: any[] = [...pendenteItems.slice(0, pendenteToSelect)];

    // Calcular a quantidade restante para completar o sorteio
    const remainingCount = quantidade - selectedItems.length;

    // Embaralhar os itens restantes (sem duplicação) e adicionar ao sorteio
    const remainingItems = [...normalItems, ...pendenteItems.slice(pendenteToSelect)];
    const shuffledRemaining = remainingItems.sort(() => Math.random() - 0.5);

    // Selecionar os itens restantes, sem repetir
    const selectedRemainingItems = shuffledRemaining.slice(0, remainingCount);

    // Garantir que não haja duplicatas no sorteio
    selectedItems = [...selectedItems, ...selectedRemainingItems];

    // Garantir que o total de sorteados seja exatamente igual à quantidade solicitada
    selectedItems = selectedItems.slice(0, quantidade);

    // Embaralhar todos os sorteados para aleatoriedade total
    selectedItems.sort(() => Math.random() - 0.5);

    setWinners(selectedItems);
  };

  // Obter os nomes das colunas a partir da primeira linha
  const columnNames = data[0] ? Object.keys(data[0]) : [];

  const botaoRef = useRef<HTMLButtonElement>(null);

  const handleKeyUp = (event: { key: string; preventDefault: () => void; }) => {
      if (event.key === 'Enter') {
          event.preventDefault();
          botaoRef.current?.click();
      }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        {/* Botão de Upload de Arquivo */}
        <label className="cursor-pointer flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-400 rounded-lg py-6 bg-gray-50 hover:bg-gray-100 transition">
          <CloudUpload size={40} className="text-blue-500 mb-2" />
          <span className="text-gray-600 font-semibold">
            {fileName ? `📂 ${fileName}` : "Clique para enviar um arquivo"}
          </span>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
        </label>

        {data.length > 0 && (
          <div className="mt-4">
            <label className="block font-semibold mb-1 text-black">Quantidade de sorteados:</label>
            <input
              type="number"
              min="1"
              max={data.length}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="border p-2 w-full rounded text-black"
              onKeyUp={handleKeyUp}
            />
          </div>
        )}

        {data.length > 0 && (
          <button onClick={handleSorteio} ref={botaoRef} className="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition">
            Sortear
          </button>
        )}
      </div>

      {winners.length > 0 && (
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full min-h-full">
          <h2 className="text-xl font-bold text-green-600 text-center">Sorteados</h2>

          {/* Tabela com rolagem horizontal apenas se necessário */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-500">
                  {columnNames.map((column, index) => (
                    <th key={index} className="border p-2 text-left text-white">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {winners.map((item, index) => (
                  <tr key={index} className="border text-black">
                    {columnNames.map((column, colIndex) => (
                      <td key={colIndex} className="border p-2">{item[column] || "Sem valor"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
