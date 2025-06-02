"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { CloudUpload, Download } from "lucide-react";

// Função para mascarar CPF - agora aceita string ou número e converte para string internamente
function maskCPF(cpf: string | number): string {
  const strCpf = String(cpf);  // <-- Garantindo que seja string
  const cleaned = strCpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return strCpf;

  return `***.${cleaned.slice(3, 6)}.${cleaned.slice(7, 9)}*-**`;
}

export default function SorteioExcel() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [winners, setWinners] = useState<Record<string, unknown>[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [fileName, setFileName] = useState<string | null>(null);

  const botaoRef = useRef<HTMLButtonElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const binaryString = e.target?.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headerRowIndex = 1; // 🔥 Ajuste aqui se o cabeçalho mudar de linha
      if (jsonData.length >= headerRowIndex + 1 && Array.isArray(jsonData[headerRowIndex])) {
        const headers = jsonData[headerRowIndex].map((header) => String(header).trim());

        const formattedData = jsonData
          .slice(headerRowIndex + 1)
          .map((row, rowIndex) => {
            if (!Array.isArray(row)) return {};

            const isEmpty = row.every(cell => cell === undefined || cell === null || cell === "");

            if (isEmpty) return null;

            const obj: { [key: string]: unknown } = { 'Número da Linha': rowIndex + headerRowIndex + 2 };

            headers.forEach((header, colIndex) => {
              let cellValue = row[colIndex];

              if (header === "Carimbo de data/hora" && cellValue) {
                let dateValue: Date;

                if (typeof cellValue === "number") {
                  dateValue = new Date((cellValue - 25569) * 86400000);
                } else {
                  dateValue = new Date(cellValue);
                }

                if (!isNaN(dateValue.getTime())) {
                  cellValue = `${String(dateValue.getDate()).padStart(2, '0')}/${String(dateValue.getMonth() + 1).padStart(2, '0')}/${dateValue.getFullYear()} ${String(dateValue.getHours()).padStart(2, '0')}:${String(dateValue.getMinutes()).padStart(2, '0')}:${String(dateValue.getSeconds()).padStart(2, '0')}`;
                } else {
                  cellValue = "Data inválida";
                }
              }

              obj[header] = cellValue !== undefined ? cellValue : "";
            });

            return obj;
          })
          .filter(row => row !== null);

        setData(formattedData as Record<string, unknown>[]);
      } else {
        console.error("Erro ao processar o arquivo: a linha de cabeçalho não é válida.");
      }
    };
  };

  const handleSorteio = () => {
    if (data.length === 0) return;

    const shuffledData = [...data].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledData.slice(0, quantidade);

    setWinners(selectedItems);
  };

  const exportToExcel = () => {
    if (winners.length === 0) return;

    const dataWithTextFormat = winners.map((item: Record<string, unknown>) => {
      const newItem: Record<string, unknown> = {};

      columnNames.forEach(col => {
        let value = item[col];

        // Se for CPF, aplica a máscara - agora sempre converte para string
        if (col.toLowerCase().includes('cpf') && value != null) {
          value = maskCPF(String(value));
        }


        newItem[col] = typeof value === 'number' && value > 9999999999
          ? String(value)
          : value;
      });

      return newItem;
    });

    const headers = [columnNames];
    const dataWithHeaders = [
      ...headers,
      ...dataWithTextFormat.map(item => columnNames.map(col => item[col] || ""))
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sorteados");

    worksheet['!cols'] = columnNames.map(col => ({
      wch: col.length + 5
    }));

    XLSX.writeFile(workbook, "sorteio_resultado.xlsx");
  };

  const columnNames: string[] = data[0] ? Object.keys(data[0]) : [];

  const handleKeyUp = (event: { key: string; preventDefault: () => void; }) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      botaoRef.current?.click();
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between w-full">
          <label className="cursor-pointer flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-400 rounded-lg py-6 bg-gray-50 hover:bg-gray-100 transition">
            <CloudUpload size={40} className="text-blue-500 mb-2" />
            <span className="text-gray-600 font-semibold">
              {fileName ? `📂 ${fileName}` : "Clique para enviar um arquivo"}
            </span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {data.length > 0 && (
          <>
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
            <button
              onClick={handleSorteio}
              ref={botaoRef}
              className="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition"
            >
              Sortear
            </button>
          </>
        )}
      </div>

      {winners.length > 0 && (
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full min-h-full">
          <div className="flex justify-end">
            <button
              onClick={exportToExcel}
              className="w-26 px-4 py-2 mt-4 bg-green-500 text-white rounded font-semibold hover:bg-green-600 transition flex items-center justify-center"
            >
              <Download size={20} className="mr-2" /> Exportar para Excel
            </button>
          </div>
          <h2 className="text-4xl mb-4 font-bold text-green-600 text-center font-anton tracking-wide">Resultado do Sorteio</h2>
          <div className="w-full overflow-x-auto rounded-lg">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-500">
                  {columnNames.map((column, index) => (
                    <th key={index} className="border p-2 text-left text-white">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {winners.length === 0 ? (
                  <tr>
                    <td colSpan={columnNames.length} className="text-center p-2">Nenhum sorteado</td>
                  </tr>
                ) : (
                  winners.map((item, index) => (
                    <tr key={index} className="border text-black ">
                      {columnNames.map((column, colIndex) => {
                        let cellValue = item[column] ?? "Sem valor";

                        // Verifica se é CPF - agora sempre converte para string antes de mascarar
                        if (column.toLowerCase().includes('cpf') && cellValue != null) {
                          cellValue = maskCPF(String(cellValue));
                        }

                        return (
                          <td key={colIndex} className="border p-2">{String(cellValue)}</td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
