package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.driver.AssignVehicleRequest;
import com.fleetfix.backend.dto.driver.DriverRequest;
import com.fleetfix.backend.dto.driver.DriverResponse;
import com.fleetfix.backend.dto.driver.DriverShiftHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DriverService {
    DriverResponse addDriver(DriverRequest request);
    DriverResponse updateDriver(Long id, DriverRequest request);
    void deleteDriver(Long id);
    DriverResponse getDriverById(Long id);
    Page<DriverResponse> listDrivers(Pageable pageable);
    DriverResponse assignVehicle(Long driverId, AssignVehicleRequest request);
    List<DriverShiftHistoryResponse> getShiftHistory(Long driverId);
}
