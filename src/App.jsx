import React, { useState, useEffect } from 'react';
import {
  Car,
  CurrencyGuarani,
  Percent,
  Calendar,
  Banknote,
  Landmark,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Main App component for the loan calculator
const App = () => {
  // State variables for user inputs
  const [precioVehiculo, setPrecioVehiculo] = useState(65000000); // Car price in Gs.
  const [entregaInicial, setEntregaInicial] = useState(15000000); // Down payment in Gs.
  const [plazoMeses, setPlazoMeses] = useState(60); // Loan term in months
  const [refuerzoAnual, setRefuerzoAnual] = useState(10000000); // Annual reinforcement amount
  const [bancoSeleccionado, setBancoSeleccionado] = useState('BancoUENO'); // Selected bank

  const [showAmortization, setShowAmortization] = useState(false); // Toggle for amortization table

  // State variables for calculated results
  const [montoAFinanciar, setMontoAFinanciar] = useState(0);
  const [cuotaMensual, setCuotaMensual] = useState(0);
  const [totalInteres, setTotalInteres] = useState(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  // Hardcoded interest rates for different banks
  const tasasBancos = {
    BancoUENO: 0.110, // 11%
    BancoITAU: 0.125, // 12.5%
    BancoCONTINENTAL: 0.140, // 14%
    BancoATLAS: 0.145, // 14.5%
    BancoFAMILIAR: 0.149, // 14.9%
  };

  // Function to format numbers as Guaraní currency
  const formatGs = (value) => {
    return `Gs. ${new Intl.NumberFormat('es-PY', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)}`;
  };

  // Main calculation logic, runs whenever inputs change
  useEffect(() => {
    const calcularPrestamo = () => {
      // Calculate the principal amount to be financed
      const montoInicial = precioVehiculo - entregaInicial;
      setMontoAFinanciar(montoInicial);

      if (montoInicial <= 0 || plazoMeses <= 0) {
        setCuotaMensual(0);
        setTotalInteres(0);
        setAmortizationSchedule([]);
        return;
      }

      const tasaAnual = tasasBancos[bancoSeleccionado];
      const tasaMensual = tasaAnual / 12;

      let saldoPendiente = montoInicial;
      let totalInteresPagado = 0;
      let schedule = [];

      // Calculate the initial monthly payment without reinforcements
      let cuota =
        (montoInicial * tasaMensual) /
        (1 - Math.pow(1 + tasaMensual, -plazoMeses));
      let cuotaActual = cuota;

      // Simulate the loan month by month
      for (let i = 1; i <= plazoMeses; i++) {
        // Recalculate monthly payment at the start of each year after a reinforcement
        if (i > 1 && (i - 1) % 12 === 0) {
          const saldoNuevo = saldoPendiente;
          const mesesRestantes = plazoMeses - (i - 1);
          if (mesesRestantes > 0) {
            cuotaActual =
              (saldoNuevo * tasaMensual) /
              (1 - Math.pow(1 + tasaMensual, -mesesRestantes));
          } else {
            cuotaActual = 0;
          }
        }

        const interesDelMes = saldoPendiente * tasaMensual;
        let amortizacionCapital = cuotaActual - interesDelMes;

        // Apply annual reinforcement payment at the end of each year
        let refuerzo = 0;
        if (i % 12 === 0 && i !== 0) {
          refuerzo = refuerzoAnual;
          amortizacionCapital += refuerzoAnual;
        }

        // Ensure amortization doesn't exceed the remaining balance
        if (amortizacionCapital > saldoPendiente) {
          amortizacionCapital = saldoPendiente;
          cuotaActual = interesDelMes + amortizacionCapital;
        }

        // Update the outstanding balance
        saldoPendiente -= amortizacionCapital;
        if (saldoPendiente < 0) saldoPendiente = 0; // Prevent negative balance

        totalInteresPagado += interesDelMes;

        // Add this month's data to the schedule
        schedule.push({
          mes: i,
          saldoInicial:
            i === 1
              ? montoInicial
              : schedule[i - 2]?.saldoFinal + (i % 12 === 1 ? refuerzoAnual : 0) || 0,
          interes: interesDelMes,
          cuota: cuotaActual,
          amortizacion: amortizacionCapital - refuerzo,
          refuerzo: refuerzo,
          saldoFinal: saldoPendiente,
        });

      }
      setCuotaMensual(cuotaActual);
      setTotalInteres(totalInteresPagado);
      setAmortizationSchedule(schedule);
    };

    calcularPrestamo();
  }, [precioVehiculo, entregaInicial, plazoMeses, refuerzoAnual, bancoSeleccionado]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Calculadora de Préstamos
        </h1>

        {/* Input section */}
        <div className="space-y-6">
          {/* Precio del Vehículo */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow-inner">
            <Car size={24} className="text-gray-500" />
            <div className="flex flex-col flex-grow">
              <label htmlFor="precio" className="text-sm font-medium text-gray-700">
                Precio del Vehículo (Gs.)
              </label>
              <input
                type="number"
                id="precio"
                value={precioVehiculo}
                onChange={(e) => setPrecioVehiculo(Number(e.target.value))}
                className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Entrega Inicial */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow-inner">
            <Banknote size={24} className="text-gray-500" />
            <div className="flex flex-col flex-grow">
              <label htmlFor="entrega" className="text-sm font-medium text-gray-700">
                Entrega Inicial (Gs.)
              </label>
              <input
                type="number"
                id="entrega"
                value={entregaInicial}
                onChange={(e) => setEntregaInicial(Number(e.target.value))}
                className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Banco y Tasa de Interés */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow-inner">
            <Landmark size={24} className="text-gray-500" />
            <div className="flex flex-col flex-grow">
              <label htmlFor="banco" className="text-sm font-medium text-gray-700">
                Banco y Tasa de Interés Anual
              </label>
              <select
                id="banco"
                value={bancoSeleccionado}
                onChange={(e) => setBancoSeleccionado(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white pr-8"
              >
                <option value="BancoUENO">Banco UENO ({Math.round(tasasBancos['BancoUENO'] * 100)}%)</option>
                <option value="BancoITAU">Banco ITAU ({Math.round(tasasBancos['BancoITAU'] * 100)}%)</option>
                <option value="BancoCONTINENTAL">Banco CONTINENTAL ({Math.round(tasasBancos['BancoCONTINENTAL'] * 100)}%)</option>
                <option value="BancoATLAS">Banco ATLAS ({Math.round(tasasBancos['BancoATLAS'] * 100)}%)</option>
                <option value="BancoFAMILIAR">Banco FAMILIAR ({Math.round(tasasBancos['BancoFAMILIAR'] * 100)}%)</option>
              </select>
            </div>
          </div>
          
          {/* Plazo del préstamo */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow-inner">
            <Calendar size={24} className="text-gray-500" />
            <div className="flex flex-col flex-grow">
              <label htmlFor="plazo" className="text-sm font-medium text-gray-700">
                Plazo del Préstamo (meses)
              </label>
              <input
                type="number"
                id="plazo"
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(Number(e.target.value))}
                className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Refuerzo Anual */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow-inner">
            <Banknote size={24} className="text-gray-500" />
            <div className="flex flex-col flex-grow">
              <label htmlFor="refuerzo" className="text-sm font-medium text-gray-700">
                Refuerzo Anual (Gs.)
              </label>
              <input
                type="number"
                id="refuerzo"
                value={refuerzoAnual}
                onChange={(e) => setRefuerzoAnual(Number(e.target.value))}
                className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Results section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Resultados del Préstamo</h2>
          <div className="flex justify-between items-center bg-blue-50 p-6 rounded-xl shadow-lg">
            <span className="text-blue-700 font-bold">Cuota Mensual Aprox.</span>
            <span className="text-2xl font-bold text-blue-900">
              {formatGs(cuotaMensual)}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Monto a Financiar:</span>
            <span className="text-gray-800 font-semibold">{formatGs(montoAFinanciar)}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Interés Total Pagado:</span>
            <span className="text-gray-800 font-semibold">{formatGs(totalInteres)}</span>
          </div>
        </div>
        
        {/* Amortization table toggle */}
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className="w-full flex justify-center items-center py-3 px-4 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-md hover:bg-gray-300 transition-all duration-200"
        >
          {showAmortization ? (
            <>
              Ocultar Cuadro de Amortización <ChevronUp size={20} className="ml-2" />
            </>
          ) : (
            <>
              Mostrar Cuadro de Amortización <ChevronDown size={20} className="ml-2" />
            </>
          )}
        </button>

        {/* Amortization table */}
        {showAmortization && (
          <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-inner mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Inicial
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuota Mensual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interés
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capital
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refuerzo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Final
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {amortizationSchedule.map((row, index) => (
                  <tr key={index} className={row.refuerzo > 0 ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">{row.mes}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatGs(row.saldoInicial)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatGs(row.cuota)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatGs(row.interes)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatGs(row.amortizacion)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">{row.refuerzo > 0 ? formatGs(row.refuerzo) : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatGs(row.saldoFinal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;

