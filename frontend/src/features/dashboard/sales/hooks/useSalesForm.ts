"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    getProducts,
    getCustomers,
    getServices,
    createSale,
} from "../services/sales.service";
import {
    IProduct,
    ICustomer,
    IService,
    ICartItem,
    ICreateSaleDto,
} from "../types/sales.type";
import { showSuccess, showError, showWarning } from "@/shared/utils/notifications";

export const useSalesForm = (onSuccess?: () => void) => {
    const router = useRouter();

    // ── Data States ──
    const [products, setProducts] = useState<IProduct[]>([]);
    const [services, setServices] = useState<IService[]>([]);
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ── Form States ──
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [notes, setNotes] = useState("");
    const [cart, setCart] = useState<ICartItem[]>([]);

    // Selection states (for external control if needed)
    const [selectedProductId, setSelectedProductId] = useState<number | "">("");
    const [quantity, setQuantity] = useState(1);
    const [productSearch, setProductSearch] = useState("");

    const TAX_PERCENT = 19;

    // ── Load Initial Data ──

    // ── Load Initial Data (Exposed for refreshing) ──
    const reloadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [pData, sData, cData] = await Promise.all([
                getProducts(),
                getServices(),
                getCustomers(),
            ]);
            setProducts(pData);
            setServices(sData.data);
            setCustomers(cData);
        } catch (err) {
            console.error(err);
            showError("Error al cargar datos del formulario.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        reloadData();
    }, [reloadData]);


    // ── Derived State ──
    const filteredProducts = useMemo(() => {
        if (!productSearch) return products;
        const lower = productSearch.toLowerCase();
        return products.filter(
            (p) =>
                p.isactive &&
                (p.productname.toLowerCase().includes(lower) ||
                    (p.productcode && p.productcode.toLowerCase().includes(lower)))
        );
    }, [productSearch, products]);

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.linetotal, 0),
        [cart]
    );

    const discountTotal = cart.reduce((sum, item) => {
        // Discount is per line calculation: unitprice * qty * discount%
        // Only if we support line discount. The interface has discountpercent.
        const lineBase = item.quantity * item.unitprice;
        return sum + (item.discountpercent > 0 ? (lineBase * item.discountpercent) / 100 : 0);
    }, 0);

    const taxAmount = useMemo(() => Math.round((subtotal - discountTotal) * (TAX_PERCENT / 100)), [subtotal, discountTotal]);
    const totalAmount = subtotal - discountTotal + taxAmount;

    // ── Handlers ──

    const addProductToCart = useCallback(
        (product: IProduct, qty: number) => {
            if (qty <= 0) return;

            // Stock validation
            const existingItem = cart.find(
                (item) => item.type === "Producto" && item.productid === product.productid
            );
            const currentQtyInCart = existingItem ? existingItem.quantity : 0;

            if (currentQtyInCart + qty > product.productstock) {
                showWarning(`Stock insuficiente. Disponible: ${product.productstock}`);
                return;
            }

            setCart((prev) => {
                const existing = prev.find(
                    (i) => i.type === "Producto" && i.productid === product.productid
                );

                const price = product.productpriceofsale || 0;

                if (existing) {
                    const newQty = existing.quantity + qty;
                    const lineTotal = newQty * price * (1 - existing.discountpercent / 100);
                    return prev.map((i) =>
                        i.id === existing.id
                            ? { ...i, quantity: newQty, linetotal: lineTotal }
                            : i
                    );
                } else {
                    const newItem: ICartItem = {
                        id: `prod-${product.productid}`,
                        type: "Producto",
                        productid: product.productid,
                        name: product.productname,
                        category: product.category?.name || "Sin Categoría",
                        image: product.image,
                        quantity: qty,
                        unitprice: price,
                        discountpercent: 0,
                        stock: product.productstock,
                        linetotal: qty * price,
                    };
                    return [...prev, newItem];
                }
            });
            showSuccess("Producto agregado");
        },
        [cart]
    );

    const addServiceToCart = useCallback(
        (service: IService, price: number) => {
            if (price <= 0) {
                showWarning("El precio del servicio debe ser mayor a 0");
                return;
            }

            setCart((prev) => {
                const existing = prev.find(
                    (i) => i.type === "Servicio" && i.serviceid === service.serviceid && i.unitprice === price
                );

                if (existing) {
                    const newQty = existing.quantity + 1;
                    const lineTotal = newQty * existing.unitprice * (1 - existing.discountpercent / 100);
                    return prev.map((i) =>
                        i.id === existing.id
                            ? { ...i, quantity: newQty, linetotal: lineTotal }
                            : i
                    );
                } else {
                    const newItem: ICartItem = {
                        id: `serv-${service.serviceid}-${Date.now()}`,
                        type: "Servicio",
                        serviceid: service.serviceid,
                        name: service.name,
                        category: service.typeofservicename || "Servicio",
                        image: service.image,
                        quantity: 1,
                        unitprice: price,
                        discountpercent: 0,
                        stock: 9999, // Infinite stock for services
                        linetotal: price,
                    };
                    return [...prev, newItem];
                }
            });
            showSuccess("Servicio agregado");
        },
        []
    );

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prev) => prev.filter((i) => i.id !== itemId));
    }, []);

    const updateCartItemQuantity = useCallback(
        (itemId: string, newQty: number) => {
            setCart((prev) =>
                prev.map((item) => {
                    if (item.id !== itemId) return item;
                    // If product, check stock
                    if (item.type === "Producto" && newQty > item.stock) {
                        showWarning(`Stock máximo: ${item.stock}`);
                        return item;
                    }
                    const qty = Math.max(1, newQty);
                    const line = qty * item.unitprice;
                    return {
                        ...item,
                        quantity: qty,
                        linetotal: line - (line * item.discountpercent) / 100,
                    };
                })
            );
        },
        []
    );

    const updateCartItemDiscount = useCallback(
        (itemId: string, discount: number) => {
            setCart((prev) =>
                prev.map((item) => {
                    if (item.id !== itemId) return item;
                    const disc = Math.max(0, Math.min(100, discount));
                    const line = item.quantity * item.unitprice;
                    return {
                        ...item,
                        discountpercent: disc,
                        linetotal: line - (line * disc) / 100,
                    };
                })
            );
        },
        []
    );


    const generateSaleCode = () => `VEN-${Date.now()}`;

    const handleSubmit = useCallback(async () => {
        if (!selectedCustomerId) {
            showWarning("Seleccione un cliente.");
            return;
        }
        if (cart.length === 0) {
            showWarning("El carrito está vacío.");
            return;
        }

        setSubmitting(true);
        try {
            const saleDto: ICreateSaleDto = {
                salecode: generateSaleCode(),
                saledate: new Date().toISOString(),
                customerid: Number(selectedCustomerId),
                subtotal,
                taxamount: taxAmount,
                discountamount: discountTotal,
                totalamount: totalAmount,
                paymentmethod: paymentMethod,
                salestatus: "Pending",
                notes,
                details: cart.map((item) => ({
                    // Send productid if exists. If service, we send 0 or valid ID?
                    // Backend requires validation. 
                    // Assuming we send only valid products for now or backend accepts services somehow.
                    // For now, mapping same as before.
                    productid: item.productid || 0,
                    quantity: item.quantity,
                    unitprice: item.unitprice,
                    discountpercent: item.discountpercent,
                    notes: item.type === "Servicio" ? "Servicio" : undefined
                })),
            };

            // Filter invalid items if backend is strict
            // saleDto.details = saleDto.details.filter(d => d.productid > 0);

            await createSale(saleDto);
            showSuccess("Venta registrada exitosamente");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Error al guardar la venta";
            showError(Array.isArray(msg) ? msg.join(", ") : msg);
        } finally {
            setSubmitting(false);
        }
    }, [
        selectedCustomerId,
        cart,
        subtotal,
        totalAmount,
        taxAmount,
        discountTotal,
        paymentMethod,
        notes,
        generateSaleCode,
        onSuccess,
    ]);

    return {
        products,
        services,
        customers,
        filteredProducts,
        loadingData,

        selectedCustomerId,
        setSelectedCustomerId,

        // Expose selection states
        selectedProductId,
        setSelectedProductId,
        quantity,
        setQuantity,
        productSearch,
        setProductSearch,

        paymentMethod,
        setPaymentMethod,
        notes,
        setNotes,

        cart,
        addProductToCart,
        addServiceToCart,
        removeFromCart,
        updateCartItemDiscount,
        updateCartItemQuantity,

        subtotal,
        discountTotal,
        taxAmount,
        totalAmount,

        TAX_PERCENT,
        handleSubmit,
        submitting,
        reloadData,
    };
};