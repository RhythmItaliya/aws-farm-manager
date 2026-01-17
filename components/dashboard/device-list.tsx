"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smartphone, Tablet, Loader2, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Device {
  arn: string;
  name: string;
  manufacturer: string;
  model: string;
  formFactor: "PHONE" | "TABLET";
  platform: "ANDROID" | "IOS";
  os: string;
  cpu: {
    architecture: string;
    clock: number;
    frequency: string;
  };
  resolution: {
    width: number;
    height: number;
  };
  heapSize: number;
  memory: number;
  image: string;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DeviceListProps {
  projectArn?: string | null;
  onConnectRequest?: (device: Device) => void;
  connectingDeviceId?: string | null;
}

export function DeviceList({ projectArn, onConnectRequest, connectingDeviceId }: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices() {
    try {
      setError(false);
      const response = await fetch("/api/devices");
      if (!response.ok) throw new Error("Failed to fetch devices");
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error(error);
      setError(true);
      toast.error("Failed to fetch devices. Check AWS credentials.");
    } finally {
      setLoading(false);
    }
  }

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(search.toLowerCase()) ||
      device.manufacturer.toLowerCase().includes(search.toLowerCase())
  );

  const groupedDevices = {
    ANDROID: {
      PHONE: filteredDevices.filter((d) => d.platform === "ANDROID" && d.formFactor === "PHONE"),
      TABLET: filteredDevices.filter(
        (d) => d.platform === "ANDROID" && d.formFactor === "TABLET"
      ),
    },
    IOS: {
      PHONE: filteredDevices.filter((d) => d.platform === "IOS" && d.formFactor === "PHONE"),
      TABLET: filteredDevices.filter((d) => d.platform === "IOS" && d.formFactor === "TABLET"),
    },
  };

  const DeviceItem = ({ device }: { device: Device }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {device.formFactor === "TABLET" ? (
            <Tablet className="h-4 w-4" />
          ) : (
            <Smartphone className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{device.name}</p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>
              {device.platform} {device.os}
            </span>
            <span>•</span>
            <span>{device.manufacturer}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {device.platform}
        </Badge>
        {projectArn && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onConnectRequest?.(device)}
            disabled={!!connectingDeviceId}
          >
            {connectingDeviceId === device.arn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Connect"
            )}
          </Button>
        )}
      </div>
    </div>
  );

  const DeviceSection = ({ title, devices }: { title: string; devices: Device[] }) => {
    if (devices.length === 0) return null;
    return (
      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground px-1">{title}</h3>
        <div className="space-y-2">
          {devices.map((device) => (
            <DeviceItem key={device.arn} device={device} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <p className="mb-2">Failed to load devices</p>
        <Button variant="outline" size="sm" onClick={fetchDevices}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="flex-1">
        {filteredDevices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No devices found</div>
        ) : (
          <Tabs defaultValue="android" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="android">Android</TabsTrigger>
              <TabsTrigger value="ios">iOS</TabsTrigger>
            </TabsList>

            <TabsContent value="android" className="mt-0">
              <DeviceSection title="Phones" devices={groupedDevices.ANDROID.PHONE} />
              <DeviceSection title="Tablets" devices={groupedDevices.ANDROID.TABLET} />
              {groupedDevices.ANDROID.PHONE.length === 0 &&
                groupedDevices.ANDROID.TABLET.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-4">
                    No Android devices found
                  </p>
                )}
            </TabsContent>

            <TabsContent value="ios" className="mt-0">
              <DeviceSection title="Phones" devices={groupedDevices.IOS.PHONE} />
              <DeviceSection title="Tablets" devices={groupedDevices.IOS.TABLET} />
              {groupedDevices.IOS.PHONE.length === 0 &&
                groupedDevices.IOS.TABLET.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-4">
                    No iOS devices found
                  </p>
                )}
            </TabsContent>
          </Tabs>
        )}
      </ScrollArea>
    </div>
  );
}
