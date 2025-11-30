import React from 'react'
import { estadoColors, tipoCitaColors } from '../../mocks/mockAppointment'

export const Legend = () => (
    <div className="mt-4 flex flex-col gap-4">
        <div>
            <h3 className="text-sm font-semibold mb-2">Estados</h3>
            <div className="grid grid-cols-2 gap-2">
                {estadoColors.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-sm font-semibold mb-2">Tipo de Registro</h3>
            <div className="grid grid-cols-2 gap-2">
                {tipoCitaColors.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span
                            className="w-4 h-4 rounded-sm border"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
