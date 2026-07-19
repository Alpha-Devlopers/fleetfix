package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.report.*;

import java.util.List;

public interface ReportService {
    List<VehicleReportItem> getVehicleReport();
    List<DriverReportItem> getDriverReport();
    List<MaintenanceReportItem> getMaintenanceReport();
    List<InventoryReportItem> getInventoryReport();
    List<RepairOrderReportItem> getRepairOrderReport();
}
