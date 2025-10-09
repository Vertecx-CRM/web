import Colors from '@/shared/theme/colors';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryAndProducts } from '../../mocks/mocksDashboard';

export const PieChartCategoryAndProducts = () => {
    const RADIAN = Math.PI / 180;
    const COLORS = [
        Colors.graphic.circle.primary,
        Colors.graphic.circle.secondary,
        Colors.graphic.circle.tertiary,
        Colors.graphic.circle.quaternary,
        Colors.graphic.circle.quinary,
        Colors.graphic.circle.scenery,
    ];
    
    const renderCustomizedLabel = ({
        cx, cy, midAngle, outerRadius, percent
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 20;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#000"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize={15}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                    <p className="font-bold text-gray-800">{`Categoría: ${data.category}`}</p>
                    <p className="text-gray-600">{`Cantidad: ${data.value}`}</p>
                    <p className="text-gray-600">{`Porcentaje: ${((data.value / CategoryAndProducts.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}</p>
                </div>
            );
        }
        return null;
    };


    const leftColumn = CategoryAndProducts.slice(0, 3);
    const rightColumn = CategoryAndProducts.slice(3);

    return (
        <div className="flex flex-col items-center w-full h-full">
            {/* Gráfico */}
            <ResponsiveContainer width="100%" height={300} >
                <PieChart>
                    <Pie
                        data={CategoryAndProducts}
                        cx="50%"
                        cy="50%"
                        labelLine={{ 
                            strokeWidth: 3,     
                            strokeOpacity: 0.8 
                        }}
                        label={renderCustomizedLabel}
                        outerRadius={90}
                        dataKey="value"
                    >
                        {CategoryAndProducts.map((entry, index) => (
                            <Cell
                                key={`cell-${entry.category}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            <h2 className="text-lg font-bold text-center mt-6 mb-4">
                Categoría de productos
            </h2>
            <div className="flex justify-center w-full gap-20">
                <div className="flex flex-col gap-3">
                    {leftColumn.map((entry, index) => (
                        <div key={entry.category} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-gray-700">{entry.category}</span>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-3">
                    {rightColumn.map((entry, index) => (
                        <div key={entry.category} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}
                            />
                            <span className="text-sm text-gray-700">{entry.category}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};