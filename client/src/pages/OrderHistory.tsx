import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getOrders } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  ChevronRight
} from "lucide-react";

const OrderHistory = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login?redirect=orders");
    return null;
  }

  // Fetch order history
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders", user?.id],
    queryFn: () => getOrders(user?.id as number),
    enabled: !!user
  });

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order: any) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  // Get status badge styling and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return {
          variant: "outline" as const,
          icon: <Clock className="h-4 w-4 mr-1" />,
          label: "Pending"
        };
      case "processing":
        return {
          variant: "warning" as const,
          icon: <Package className="h-4 w-4 mr-1" />,
          label: "Processing"
        };
      case "shipped":
        return {
          variant: "secondary" as const,
          icon: <Truck className="h-4 w-4 mr-1" />,
          label: "Shipped"
        };
      case "delivered":
        return {
          variant: "success" as const,
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          label: "Delivered"
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          icon: <XCircle className="h-4 w-4 mr-1" />,
          label: "Cancelled"
        };
      default:
        return {
          variant: "outline" as const,
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          label: status
        };
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Order History</h1>
        <Button 
          variant="outline" 
          className="mt-4 md:mt-0" 
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-medium mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Button 
              className="bg-primary hover:bg-red-600"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-gray-500">No orders found with this status.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order: any) => {
                const statusInfo = getStatusBadge(order.status);
                const orderDate = formatDate(order.orderDate);
                const totalItems = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
                
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 py-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                            <Badge variant={statusInfo.variant} className="ml-3 flex items-center">
                              {statusInfo.icon}
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">Placed on {orderDate}</p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
                          <p className="font-medium mr-4">Total: {formatPrice(order.total)}</p>
                          {order.status === "shipped" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                            >
                              Track Package
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`order-${order.id}`} className="border-0">
                          <div className="px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center">
                              <Package className="h-5 w-5 text-gray-500 mr-2" />
                              <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                            </div>
                            <AccordionTrigger className="py-0">
                              <span className="text-sm text-primary mr-2">View Order Details</span>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent>
                            <div className="px-6 pb-4">
                              <div className="mb-4">
                                <h3 className="font-medium mb-2">Shipping Address</h3>
                                <p className="text-sm text-gray-600">
                                  {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}
                                </p>
                              </div>
                              
                              <h3 className="font-medium mb-2">Items</h3>
                              <div className="space-y-4">
                                {order.items.map((item: any) => (
                                  <div key={item.id} className="flex space-x-4">
                                    {item.product?.imageUrl && (
                                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                                        <img 
                                          src={item.product.imageUrl} 
                                          alt={item.product.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <h4 className="font-medium hover:text-primary cursor-pointer" onClick={() => navigate(`/products/${item.product.id}`)}>
                                          {item.product.name}
                                        </h4>
                                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                      </div>
                                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                      <p className="text-sm text-gray-500">Item Price: {formatPrice(item.price)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <Separator className="my-4" />
                              
                              <div className="flex justify-between font-medium">
                                <span>Order Total:</span>
                                <span>{formatPrice(order.total)}</span>
                              </div>
                              
                              {(order.status === "pending" || order.status === "processing") && (
                                <div className="mt-4 flex justify-end">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                  >
                                    Cancel Order
                                  </Button>
                                </div>
                              )}
                              
                              {order.status === "delivered" && (
                                <div className="mt-4 flex justify-end">
                                  <Button 
                                    size="sm"
                                    className="bg-primary hover:bg-red-600"
                                  >
                                    Buy Again
                                  </Button>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistory;
