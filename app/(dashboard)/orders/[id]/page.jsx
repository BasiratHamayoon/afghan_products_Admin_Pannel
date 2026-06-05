"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Trash2, XCircle, Loader2, ShoppingCart,
  User, Mail, Phone, MapPin, DollarSign, Calendar,
  CreditCard, FileText, Package, Hash, CheckCircle, Truck,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { fetchOrderById, deleteOrder } from "@/store/actions/ordersActions";
import { getFileUrl } from "@/lib/fileUrl";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const statusConfig = {
  PENDING: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  CONFIRMED: { label: "Confirmed", bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
  PROCESSING: { label: "Processing", bg: "bg-indigo-500/10", text: "text-indigo-600", dot: "bg-indigo-500" },
  SHIPPED: { label: "Shipped", bg: "bg-purple-500/10", text: "text-purple-600", dot: "bg-purple-500" },
  DELIVERED: { label: "Delivered", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  PARTIALLY_REJECTED: { label: "Partial Reject", bg: "bg-orange-500/10", text: "text-orange-600", dot: "bg-orange-500" },
  COMPLETED: { label: "Completed", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
};

const paymentStatusConfig = {
  PAID: { label: "Paid", bg: "bg-emerald-500/10", text: "text-emerald-600" },
  UNPAID: { label: "Unpaid", bg: "bg-red-500/10", text: "text-red-500" },
  PENDING: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600" },
  REFUNDED: { label: "Refunded", bg: "bg-blue-500/10", text: "text-blue-600" },
};

const itemStatusConfig = {
  PENDING: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600" },
  CONFIRMED: { label: "Confirmed", bg: "bg-blue-500/10", text: "text-blue-600" },
  SHIPPED: { label: "Shipped", bg: "bg-purple-500/10", text: "text-purple-600" },
  DELIVERED: { label: "Delivered", bg: "bg-emerald-500/10", text: "text-emerald-600" },
  REJECTED: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-500" },
  CANCELLED: { label: "Cancelled", bg: "bg-red-500/10", text: "text-red-500" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function OrderItemRow({ item, index }) {
  if (!item) return null;
  const isc = itemStatusConfig[item.status] || itemStatusConfig.PENDING;
  const imageUrl = item.productImage ? getFileUrl(item.productImage) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
    >
      <div className="h-12 w-12 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center shrink-0 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover" />
        ) : (
          <Package className="h-5 w-5 text-[#0F69B0]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold text-foreground truncate">{item.productName || "—"}</p>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", isc.bg, isc.text)}>
            {isc.label}
          </span>
        </div>
        {item.sellerName && (
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
            Seller: {item.sellerName}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-[10px] font-medium text-muted-foreground">
            Qty: <span className="font-bold text-foreground">{item.quantity}</span>
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            Unit: <span className="font-bold text-foreground">AFN {Number(item.unitPrice).toLocaleString()}</span>
          </span>
          <span className="text-[10px] font-bold text-[#0F69B0]">
            AFN {Number(item.totalPrice).toLocaleString()}
          </span>
        </div>
        {item.rejectionReason && (
          <p className="text-[10px] text-red-500 font-medium mt-1">
            Reason: {item.rejectionReason}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedOrder, isDetailLoading } = useSelector((state) => state.orders);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchOrderById(id)).then((res) => {
      if (!res?.success) setNotFound(true);
    });
  }, [id, dispatch]);

  const order = selectedOrder?.id === id ? selectedOrder : null;

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(deleteOrder(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Order deleted");
      router.push("/orders");
    } else {
      toast.error(res?.message || "Failed to delete");
    }
    setDeleteDialog(false);
  };

  if (isDetailLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">Loading order...</p>
        </div>
      </div>
    );
  }

  if (notFound || (!isDetailLoading && !order?.id)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Order not found</h2>
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) return null;

  const status = statusConfig[order.status] || statusConfig.PENDING;
  const paymentStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.PENDING;
  const attachmentUrl = order.attachment ? getFileUrl(order.attachment) : null;
  const isPending = order.status === "PENDING";
  const safeItems = Array.isArray(order.items) ? order.items : [];

  const orderFields = [
    { label: "Order Number", value: order.orderNumber || order.id, icon: Hash },
    { label: "Order Status", value: status.label, icon: CheckCircle },
    { label: "Total Amount", value: `AFN ${Number(order.totalAmount).toLocaleString()}`, icon: DollarSign },
    { label: "Tax", value: `AFN ${Number(order.taxPrice).toLocaleString()}`, icon: DollarSign },
    { label: "Shipping Fee", value: `AFN ${Number(order.shippingPrice).toLocaleString()}`, icon: DollarSign },
    { label: "Items Count", value: `${safeItems.length} item${safeItems.length !== 1 ? "s" : ""}`, icon: Package },
    { label: "Payment Method", value: order.paymentMethod || "—", icon: CreditCard },
    { label: "Payment Status", value: paymentStatus.label, icon: DollarSign },
    { label: "Delivery Method", value: order.deliveryMethod || "—", icon: Truck },
    { label: "Created", value: formatDate(order.createdAt), icon: Calendar },
    { label: "Updated", value: formatDate(order.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="Order Detail"
        description={order.orderNumber ? `Order #${order.orderNumber}` : "Order Details"}
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>
          {isPending && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDeleteDialog(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </motion.button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden flex flex-col items-center text-center"
        >
          <div
            className="h-24 w-full relative"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <div className="absolute inset-0">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          </div>

          <div className="-mt-8 mb-3 relative z-10">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center shadow-xl ring-[3px] ring-white dark:ring-[#0f1420]"
              style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
            >
              <ShoppingCart className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="px-5 pb-5 w-full">
            <h3 className="text-base font-black text-foreground mb-1">
              {order.orderNumber ? `#${order.orderNumber}` : `Order ${order.id.slice(0, 8)}...`}
            </h3>

            <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
              <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full", status.bg, status.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
              <span className={cn("inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full", paymentStatus.bg, paymentStatus.text)}>
                {paymentStatus.label}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-sm font-black text-foreground">
              <DollarSign className="h-4 w-4 text-[#0F69B0]" />
              AFN {Number(order.totalAmount).toLocaleString()}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground font-medium">
              <Package className="h-3.5 w-3.5" />
              {safeItems.length} item{safeItems.length !== 1 ? "s" : ""}
            </div>

            {order.paymentMethod && (
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                <CreditCard className="h-3.5 w-3.5" />
                {order.paymentMethod}
              </div>
            )}

            {order.deliveryMethod && (
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                <Truck className="h-3.5 w-3.5" />
                {order.deliveryMethod}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">Order Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {orderFields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <div
                    key={field.label}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(15,105,176,0.08)" }}
                    >
                      <FieldIcon className="h-3.5 w-3.5 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        {field.label}
                      </p>
                      <p className="text-xs font-bold text-foreground break-all">
                        {field.value || "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">Buyer Information</h3>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg shrink-0"
                style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
              >
                {getInitials(order.buyerName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-foreground">{order.buyerName || "—"}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {order.buyerEmail && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground font-medium">{order.buyerEmail}</p>
                    </div>
                  )}
                  {order.buyerPhone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground font-medium">{order.buyerPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {order.shippingAddress && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                      Shipping Address
                    </p>
                    <p className="text-xs text-foreground font-medium">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">Order Items</h3>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">
                {safeItems.length} item{safeItems.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3">
              {safeItems.length > 0 ? (
                safeItems.map((item, i) => (
                  <OrderItemRow key={item.id || i} item={item} index={i} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium">
                  No items in this order
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06] space-y-2">
              {order.taxPrice > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">Tax</span>
                  <span className="font-bold">AFN {Number(order.taxPrice).toLocaleString()}</span>
                </div>
              )}
              {order.shippingPrice > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">Shipping</span>
                  <span className="font-bold">AFN {Number(order.shippingPrice).toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/[0.06]">
                <span className="text-sm font-bold text-muted-foreground">Order Total</span>
                <span className="text-lg font-black text-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-[#0F69B0]" />
                  AFN {Number(order.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">{order.notes}</p>
            </div>
          )}

          {attachmentUrl && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">Payment Attachment</h3>
              </div>
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl border border-[#0F69B0]/20 bg-[#0F69B0]/[0.03] hover:bg-[#0F69B0]/[0.06] transition-colors cursor-pointer"
              >
                <FileText className="h-5 w-5 text-[#0F69B0]" />
                <span className="text-sm font-bold text-[#0F69B0]">View Attachment</span>
              </a>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        description="Are you sure you want to delete this pending order? This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}