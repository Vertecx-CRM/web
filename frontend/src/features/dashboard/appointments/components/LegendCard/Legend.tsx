import React from 'react'
import { estadoColors, tipoCitaColors } from '../../mocks/mockAppointment'

export const Legend = () => {
    return (
        <div className="mt-4 flex flex-col gap-4">
            {/* Estados */}
            <div>
                <h3 className="text-sm font-semibold mb-2">Estados</h3>
                <div className="flex flex-wrap gap-3">
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

            {/* Tipos de cita */}
            <div>
                <h3 className="text-sm font-semibold mb-2">Tipos de Cita</h3>
                <div className="flex flex-wrap gap-3">
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
    )
}
