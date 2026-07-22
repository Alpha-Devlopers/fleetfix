import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

// --- Interfaces ---
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'fleet-owner' | 'service-center' | 'admin';
  phone?: string;
  company?: string;
  avatarUrl?: string;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light' | 'glass';
  status?: 'Pending' | 'Approved' | 'Blocked' | 'Active'; // for Service Centers & Users
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: 'Truck' | 'Trailer' | 'Van' | 'Sedan';
  status: 'Running' | 'Idle' | 'Maintenance' | 'Out of Service';
  health: number; // 0 - 100
  odometer: number;
  fuelLevel: number; // 0 - 100
  engineTemp: number; // °C
  currentSpeed: number; // km/h
  engineStatus: 'Active' | 'Inactive';
  company: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  latitude: number;
  longitude: number;
  lastService: string;
  nextMaintenance: string;
  image: string;
  manufacturingYear?: number;
  location?: string;
  maintenanceStatus?: string;
  engineHealth?: string;
  insurancePolicy?: string;
  insuranceProvider?: string;
  insuranceValidity?: string;
  rcNumber?: string;
  rcOwnerName?: string;
  rcRegistrationDate?: string;
  rcValidity?: string;
  permitDocUrl?: string;
  fitnessDocUrl?: string;
  emissionDocUrl?: string;
}


export interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  description: string;
  cost: number; // in INR
  mechanic: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  phone: string;
  email: string;
  experience: number; // years
  salary: number; // in INR
  status: 'Available' | 'On Trip' | 'Off Duty';
  assignedVehicleId?: string;
  assignedVehiclePlate?: string;
  rating: number; // 1.0 - 5.0
  joinDate: string;
  avatarUrl?: string;
}

export interface TripRecord {
  id: string;
  driverId: string;
  driverName: string;
  date: string;
  route: string;
  distance: number; // km
  duration: string;
  status: 'Completed' | 'Cancelled' | 'Active';
}

export interface FaultAlert {
  id: string;
  dtc: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Low';
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  time: string;
  status: 'Unresolved' | 'Repairing' | 'Resolved';
  vehicleImage?: string;
  driverPhoto?: string;
  driverName?: string;
}

export interface AIOrder {
  alertId: string;
  dtc: string;
  procedure: string[];
  tools: string[];
  parts: { name: string; quantity: number; cost: number }[]; // in INR
  timeEstimate: string;
  costEstimate: number; // in INR
  status: 'Generated' | 'Approved' | 'In Progress' | 'Completed';
}

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  stock: number;
  minThreshold: number;
  price: number; // in INR
  rackLocation: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  createdDate: string;
  status: 'Open' | 'In Progress' | 'Closed';
  customerName: string;
  customerEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private readonly delayTime = 300;

  private userPasswords = new Map<string, string>([
    ['admin@fleetfix.com', 'admin123'],
    ['owner@fleetfix.com', 'owner123'],
    ['garage@fleetfix.com', 'garage123']
  ]);

  private readonly indianDriverAvatars = [
    '/images/drivers/sai_kiran.png',
    '/images/drivers/venkatesh_reddy.png',
    '/images/drivers/ravi_teja.png',
    '/images/drivers/mahesh_reddy.png',
    '/images/drivers/anand_kumar.png',
    '/images/drivers/suresh_babu.png'
  ];

  // --- Image Pools ---
  private readonly uniquePortraits = [
    'photo-1607990283143-e81e7a2c93ab', 'photo-1624561172888-ac93c696e10c', 'photo-1615813967515-e1838c1c5116',
    'photo-1507003211169-0a1dd7228f2d', 'photo-1506794778202-cad84cf45f1d', 'photo-1560250097-0b93528c311a',
    'photo-1519085360753-af0119f7cbe7', 'photo-1500648767791-00dcc994a43e', 'photo-1539571696357-5a69c17a67c6',
    'photo-1618018352910-72bdafdc52a6', 'photo-1584043720379-b56cd9199c94', 'photo-1568602471122-7832951cc4c5',
    'photo-1605462863863-10d9e47e15ee', 'photo-1507679799987-c73779587ccf', 'photo-1530268729831-4b0b9e170218',
    'photo-1542909168-82c3e7fdca5c', 'photo-1522075469751-3a6694fb2f61', 'photo-1544725176-7c40e5a71c5e',
    'photo-1489980508314-941910ded1f4', 'photo-1531427186611-ecfd6d936c79', 'photo-1500048993953-d23a436266cf',
    'photo-1535713875002-d1d0cf377fde', 'photo-1570295999919-56ceb5ecca61', 'photo-1580489944761-15a19d654956',
    'photo-1438761681033-6461ffad8d80', 'photo-1566753323558-f4e0952af115', 'photo-1509305717900-84f40a7b6c0b',
    'photo-1504257400765-17774ad7f7f5', 'photo-1513956589380-bad6acb9b9d4', 'photo-1508214751196-bcfd4ca60f91',
    'photo-1541577140430-9a321aa83817', 'photo-1547425260-76bcadfb4f2c', 'photo-1551836022-d5d88e9218df',
    'photo-1503023345310-bd7c1de61c7d', 'photo-1519345182560-3f2917c472ef', 'photo-1492562080023-ab3db95bfbce',
    'photo-1484186139897-d5fc6b908812', 'photo-1517841905240-472988babdf9', 'photo-1537368910025-700350fe46c7',
    'photo-1534308983496-4fabb1a015ee', 'photo-1520156473395-53398c734347', 'photo-1626014303757-613551e57a6b',
    'photo-1595152772835-219674b2a8a6', 'photo-1610030469983-98e550d6193c', 'photo-1615813967515-e1838c1c5116',
    'photo-1624561172888-ac93c696e10c', 'photo-1607990283143-e81e7a2c93ab', 'photo-1506794778202-cad84cf45f1d',
    'photo-1507003211169-0a1dd7228f2d', 'photo-1500648767791-00dcc994a43e'
  ];

  private readonly uniqueVehicles = [
    'photo-1601584115197-04ecc0da31d7', 'photo-1586528116311-ad8dd3c8310d', 'photo-1590674899484-d5640e854abe',
    'photo-1501700490688-4095bfa61002', 'photo-1544620347-c4fd4a3d5957', 'photo-1559136555-9303baea8ebd',
    'photo-1516576224476-6fa44a7b6c0b', 'photo-1566576721346-d4a3b4ea35bc', 'photo-1580674684081-7617fbf3d745',
    'photo-1616422285623-13ff0162193c', 'photo-1532601224476-15c79f2f7a51', 'photo-1570125909232-eb263c188f7e',
    'photo-1519003722824-192514ab9e92', 'photo-1582268611958-ebfd161ef9cf', 'photo-1494412574643-ff11b0a5c1c3',
    'photo-1563986768609-322da13575f3', 'photo-1551524559-8af4e6624178', 'photo-1592838064575-70ed626d3a44',
    'photo-1578328819058-b69f3a3b0f6b', 'photo-1503376780353-7e6692767b70', 'photo-1527262275122-c1590eab8664',
    'photo-1599819811279-d5ad9cccf838', 'photo-1580674271209-4004d98b4a7d', 'photo-1606208427954-ff853c396657',
    'photo-1610448721566-47369c768e70', 'photo-1542838132-92c53300491e', 'photo-1522335789203-aabd1fc54bc9',
    'photo-1605276374104-dee2a0ed3cd6', 'photo-1506015391300-4802db74de2e', 'photo-1534088568595-a066f410bcda',
    'photo-1552519507-da3b142c6e3d', 'photo-1486006920555-c77dce18193b', 'photo-1518770660439-4636190af475',
    'photo-1541899481282-d53bffe3c35d', 'photo-1527262275122-c1590eab8664', 'photo-1599819811279-d5ad9cccf838',
    'photo-1580674271209-4004d98b4a7d', 'photo-1606208427954-ff853c396657', 'photo-1610448721566-47369c768e70',
    'photo-1542838132-92c53300491e', 'photo-1578328819058-b69f3a3b0f6b', 'photo-1503376780353-7e6692767b70',
    'photo-1519003722824-192514ab9e92', 'photo-1582268611958-ebfd161ef9cf', 'photo-1494412574643-ff11b0a5c1c3',
    'photo-1563986768609-322da13575f3', 'photo-1551524559-8af4e6624178', 'photo-1592838064575-70ed626d3a44',
    'photo-1601584115197-04ecc0da31d7', 'photo-1586528116311-ad8dd3c8310d'
  ];

  private readonly indianFirstNames = [
    'Rahul', 'Arjun', 'Ramesh', 'Vikram', 'Suresh', 'Naveen', 'Prakash', 'Sanjay',
    'Karthik', 'Mahesh', 'Ajay', 'Ravi', 'Sai', 'Manjunath', 'Venkatesh', 'Mohammed',
    'Abdul', 'Gopal', 'Dinesh', 'Anand', 'Rajesh', 'Amit', 'Vijay', 'Sunil', 'Karan',
    'Deepak', 'Anil', 'Sandeep', 'Pradeep', 'Harish', 'Vivek', 'Manoj', 'Ashok', 'Sanjay'
  ];

  private readonly indianLastNames = [
    'Sharma', 'Kumar', 'Patel', 'Singh', 'Reddy', 'Yadav', 'Verma', 'Teja', 'Kiran',
    'Gowda', 'Rao', 'Irfan', 'Rahman', 'Krishna', 'Raj', 'Joshi', 'Mehra', 'Gupta',
    'Deshmukh', 'Nair', 'Pillai', 'Choudhury', 'Bose', 'Sen', 'Das', 'Pandey', 'Mishra'
  ];

  private readonly indianLogisticsCompanies = [
    'V-Trans India Logistics', 'Blue Dart Express', 'Safexpress India', 'Gati-KWE Logistics',
    'Delhivery Corp', 'TCI Supply Chain Solutions', 'InterGlobe Logistics', 'DTC Indian Roadways',
    'Jai Hind Freight Carriers', 'Mahindra Logistics Hub'
  ];

  private readonly indianCities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
  ];

  private readonly vehicleModelPool = [
    'Tata Prima', 'Tata Signa', 'Ashok Leyland 2820', 'BharatBenz 3528',
    'Eicher Pro Series', 'Mahindra Blazo X', 'Tata Ace Gold', 'Ashok Leyland Dost',
    'Mahindra Bolero Pickup', 'Force Traveller', 'Eicher Bus', 'BharatBenz Bus'
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // --- Subject Database Hooks ---
  private vehicles$ = new BehaviorSubject<Vehicle[]>([]);
  private serviceRecords$ = new BehaviorSubject<ServiceRecord[]>([]);
  private drivers$ = new BehaviorSubject<Driver[]>([]);
  private tripRecords$ = new BehaviorSubject<TripRecord[]>([]);
  private faultAlerts$ = new BehaviorSubject<FaultAlert[]>([]);
  private aiOrders$ = new BehaviorSubject<AIOrder[]>([]);
  private parts$ = new BehaviorSubject<Part[]>([]);

  // Multi-Role Mock Databases
  private tickets$ = new BehaviorSubject<SupportTicket[]>([]);
  private users$ = new BehaviorSubject<User[]>([]);

  // Generated Lists for validation
  mechanics: { name: string; shop: string }[] = [];
  dispatchers: string[] = [];
  adminUsers: string[] = [];

  constructor() {
    this.generateIndianLogisticsDummyData();

    // Initialize localStorage user database tables if not existing
    this.loadUsers();
    this.loadPasswords();

    // Restore JWT session on start if token exists and is valid
    const token = localStorage.getItem('jwt_token');
    const expiryStr = localStorage.getItem('jwt_token_expiry');
    const email = localStorage.getItem('jwt_user_email') || '';
    if (token && expiryStr && email && Date.now() < parseInt(expiryStr, 10)) {
      const user = this.loadUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        this.currentUserSubject.next(user);
      } else {
        this.logoutSync();
      }
    } else {
      this.logoutSync();
    }

    // Movement Simulation
    setInterval(() => {
      const current = this.vehicles$.value;
      const updated = current.map(v => {
        if (v.status === 'Running') {
          const latOffset = (Math.random() - 0.5) * 0.0009;
          const lngOffset = (Math.random() - 0.5) * 0.0009;
          let fuel = v.fuelLevel - (Math.random() > 0.95 ? 1 : 0);
          if (fuel < 5) fuel = 95;
          let temp = v.engineTemp + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0);
          temp = Math.max(80, Math.min(110, temp));

          return {
            ...v,
            latitude: Number((v.latitude + latOffset).toFixed(6)),
            longitude: Number((v.longitude + lngOffset).toFixed(6)),
            fuelLevel: fuel,
            engineTemp: temp,
            odometer: v.odometer + Number((Math.random() * 0.1).toFixed(2)),
            currentSpeed: Math.floor(65 + Math.random() * 15)
          };
        }
        return v;
      });
      this.vehicles$.next(updated);
    }, 4000);
  }

  private getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // --- Dynamic Model-to-Image Helper ---
  getVehicleImageForModel(model: string, index: number = 0): string {
    const cleanModel = model.toLowerCase();
    if (cleanModel.includes('eicher')) return '/images/vehicles/eicher_pro_6016.png';
    if (cleanModel.includes('signa') || cleanModel.includes('tata')) return '/images/vehicles/tata_signa_4018.png';
    if (cleanModel.includes('2820') || cleanModel.includes('leyland')) return '/images/vehicles/ashok_leyland_2820.png';
    if (cleanModel.includes('3528') || cleanModel.includes('benz') || cleanModel.includes('bharatbenz')) return '/images/vehicles/bharatbenz_3528.png';
    return '/images/vehicles/eicher_pro_6016.png';
  }

  // --- Database Generator ---
  private generateIndianLogisticsDummyData() {
    // 1. Generate 20 Mechanics
    for (let i = 0; i < 20; i++) {
      const name = `${this.getRandomItem(this.indianFirstNames)} ${this.getRandomItem(this.indianLastNames)}`;
      const shop = this.getRandomItem(['Apex Truck Care', 'Jai Hind Garage', 'Sai Ram Motors', 'Balaji Fleet Services', 'Maruti Auto Garage']);
      this.mechanics.push({ name, shop });
    }

    // 2. Generate 5 Dispatchers
    for (let i = 0; i < 5; i++) {
      this.dispatchers.push(`${this.getRandomItem(this.indianFirstNames)} ${this.getRandomItem(this.indianLastNames)}`);
    }

    // 3. Generate 10 Admins
    for (let i = 0; i < 10; i++) {
      this.adminUsers.push(`${this.getRandomItem(this.indianFirstNames)} ${this.getRandomItem(this.indianLastNames)}`);
    }

    // 4. Generate Drivers with unique realistic AP & Telangana portrait photos
    const driversList: Driver[] = [];
    const driverDetails = [
      { id: 'd-201', name: 'Sai Kiran', phone: '+91 9012345678', avatarUrl: '/images/drivers/sai_kiran.png', status: 'On Trip' as const, rating: 4.8 },
      { id: 'd-202', name: 'Venkatesh Reddy', phone: '+91 9876543210', avatarUrl: '/images/drivers/venkatesh_reddy.png', status: 'On Trip' as const, rating: 4.6 },
      { id: 'd-203', name: 'Ravi Teja', phone: '+91 9345678901', avatarUrl: '/images/drivers/ravi_teja.png', status: 'Off Duty' as const, rating: 4.2 },
      { id: 'd-204', name: 'Mahesh Reddy', phone: '+91 9988776655', avatarUrl: '/images/drivers/mahesh_reddy.png', status: 'On Trip' as const, rating: 4.9 },
      { id: 'd-205', name: 'Anand Kumar', phone: '+91 9123456789', avatarUrl: '/images/drivers/anand_kumar.png', status: 'Available' as const, rating: 4.7 },
      { id: 'd-206', name: 'Suresh Babu', phone: '+91 9543216789', avatarUrl: '/images/drivers/suresh_babu.png', status: 'On Trip' as const, rating: 4.5 }
    ];

    for (let i = 0; i < driverDetails.length; i++) {
      const details = driverDetails[i];
      const licenseState = i % 2 === 0 ? 'AP' : 'TS';
      const experience = 5 + (i * 3);
      driversList.push({
        id: details.id,
        name: details.name,
        phone: details.phone,
        email: `${details.name.toLowerCase().replace(/\s+/g, '.')}@fleetfix.com`,
        licenseNo: `DL-${licenseState}${100000 + i}`,
        experience,
        salary: 28000 + (i * 4000), // INR
        status: details.status === 'On Trip' ? 'On Trip' : (details.status === 'Off Duty' ? 'Off Duty' : 'Available'),
        rating: details.rating,
        joinDate: `2024-0${(i % 5) + 1}-15`,
        avatarUrl: details.avatarUrl
      });
    }
    this.drivers$.next(driversList);

    // 5. Generate 4 Vehicles with model-matching commercial images
    const vehiclesList: Vehicle[] = [];
    const vehicleSpecs = [
      {
        id: 'v-101',
        model: 'Eicher Pro 6016',
        plate: 'AP39TX4587',
        image: '/images/vehicles/eicher_pro_6016.png',
        location: 'Visakhapatnam',
        latitude: 17.6868,
        longitude: 83.2185,
        status: 'Running' as const,
        fuelLevel: 82,
        health: 95,
        engineHealth: 'Healthy',
        maintenanceStatus: 'Not Required',
        lastService: '2026-06-15',
        nextMaintenance: '2026-10-20',
        odometer: 48500,
        temp: 85
      },
      {
        id: 'v-102',
        model: 'Tata Signa 4018',
        plate: 'TS09AB6721',
        image: '/images/vehicles/tata_signa_4018.png',
        location: 'Hyderabad',
        latitude: 17.3850,
        longitude: 78.4867,
        status: 'Running' as const,
        fuelLevel: 75,
        health: 88,
        engineHealth: 'Healthy',
        maintenanceStatus: 'Due in 15 Days',
        lastService: '2026-05-10',
        nextMaintenance: '2026-08-05',
        odometer: 104200,
        temp: 90
      },
      {
        id: 'v-103',
        model: 'Ashok Leyland 2820',
        plate: 'AP16CD9870',
        image: '/images/vehicles/ashok_leyland_2820.png',
        location: 'Vijayawada',
        latitude: 16.5062,
        longitude: 80.6480,
        status: 'Maintenance' as const,
        fuelLevel: 40,
        health: 60,
        engineHealth: 'Oil Service Required',
        maintenanceStatus: 'In Progress',
        lastService: '2026-02-28',
        nextMaintenance: '2026-07-25',
        odometer: 185300,
        temp: 105
      },
      {
        id: 'v-104',
        model: 'BharatBenz 3528',
        plate: 'TS11GH2456',
        image: '/images/vehicles/bharatbenz_3528.png',
        location: 'Warangal',
        latitude: 17.9784,
        longitude: 79.5941,
        status: 'Running' as const,
        fuelLevel: 91,
        health: 98,
        engineHealth: 'Excellent',
        maintenanceStatus: 'Completed',
        lastService: '2026-07-15',
        nextMaintenance: '2026-11-15',
        odometer: 24600,
        temp: 82
      }
    ];

    for (let i = 0; i < 4; i++) {
      const spec = vehicleSpecs[i];
      const driver = driversList[i];
      if (driver) {
        driver.assignedVehicleId = spec.id;
        driver.assignedVehiclePlate = spec.plate;
      }
      vehiclesList.push({
        id: spec.id,
        plate: spec.plate,
        model: spec.model,
        type: 'Truck',
        status: spec.status,
        health: spec.health,
        odometer: spec.odometer,
        fuelLevel: spec.fuelLevel,
        engineTemp: spec.temp,
        currentSpeed: spec.status === 'Running' ? 65 + (i * 4) : 0,
        engineStatus: spec.status === 'Running' ? 'Active' : 'Inactive',
        company: 'Safexpress India Logistics',
        driverId: driver?.id,
        driverName: driver?.name,
        driverPhone: driver?.phone,
        driverPhoto: driver?.avatarUrl,
        latitude: spec.latitude,
        longitude: spec.longitude,
        lastService: spec.lastService,
        nextMaintenance: spec.nextMaintenance,
        image: spec.image,
        manufacturingYear: 2021 + i,
        location: spec.location,
        maintenanceStatus: spec.maintenanceStatus,
        engineHealth: spec.engineHealth,
        insurancePolicy: `INS-${spec.plate}-9087`,
        insuranceProvider: 'HDFC Ergo General Insurance',
        insuranceValidity: '2027-03-31',
        rcNumber: `RC-${spec.plate}-8877`,
        rcOwnerName: 'Safexpress India Logistics',
        rcRegistrationDate: `202${1 + i}-04-12`,
        rcValidity: `203${6 + i}-04-11`,
        permitDocUrl: `/documents/permit-${spec.id}.pdf`,
        fitnessDocUrl: `/documents/fitness-${spec.id}.pdf`,
        emissionDocUrl: `/documents/emission-${spec.id}.pdf`
      });
    }
    this.vehicles$.next(vehiclesList);

    // 6. Generate 100 Maintenance Records
    const maintenanceRecords: ServiceRecord[] = [];
    const maintenanceActions = [
      'Engine Lubrication and Oil Filter Flush',
      'Exhaust manifold and Catalytic converter inspection',
      'Air Brake System Caliper and Pad replacement',
      'Propeller shaft universal joint greasing',
      'Differential fluid check and replacement',
      'Clutch plate alignment and cable adjust',
      'Front Radial Tire Alignment and pressure test'
    ];

    for (let i = 1; i <= 100; i++) {
      const v = this.getRandomItem(vehiclesList);
      const mech = this.getRandomItem(this.mechanics);
      maintenanceRecords.push({
        id: `sr-${500 + i}`,
        vehicleId: v.id,
        date: `2026-0${Math.floor(1 + Math.random() * 6)}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, '0')}`,
        description: this.getRandomItem(maintenanceActions),
        cost: Math.floor(8500 + Math.random() * 45000), // INR
        mechanic: `${mech.name} (${mech.shop})`
      });
    }
    this.serviceRecords$.next(maintenanceRecords);

    // 7. Generate 150 Diagnostics Fault Records
    const diagnosticAlerts: FaultAlert[] = [];
    const faultsPool = [
      { dtc: 'P0302', desc: 'Cylinder 2 Combustion Misfire Detected', sev: 'Critical' },
      { dtc: 'P0420', desc: 'Exhaust Catalyst System Efficiency Below Threshold', sev: 'Warning' },
      { dtc: 'P0171', desc: 'Fuel Air Mixture System Too Lean (Bank 1)', sev: 'Low' },
      { dtc: 'P0011', desc: 'A Camshaft VVT Timing Over-Advanced (Bank 1)', sev: 'Critical' },
      { dtc: 'P0300', desc: 'Multiple Engine Cylinder Misfires Registered', sev: 'Critical' },
      { dtc: 'P0113', desc: 'Intake Air Temperature Sensor Circuit High', sev: 'Low' },
      { dtc: 'P0299', desc: 'Turbocharger Underboost Condition Detected', sev: 'Warning' }
    ];

    for (let i = 1; i <= 150; i++) {
      const v = vehiclesList[i % vehiclesList.length];
      const fault = faultsPool[i % faultsPool.length];
      const status: FaultAlert['status'] = i <= 6 ? 'Unresolved' : (i <= 10 ? 'Repairing' : 'Resolved');

      diagnosticAlerts.push({
        id: `a-${500 + i}`,
        dtc: fault.dtc,
        description: fault.desc,
        severity: fault.sev as any,
        vehicleId: v.id,
        vehiclePlate: v.plate,
        vehicleModel: v.model,
        time: `2026-07-${String(Math.floor(10 + Math.random() * 8)).padStart(2, '0')} 1${Math.floor(1 + Math.random() * 8)}:30`,
        status
      });
    }
    this.faultAlerts$.next(diagnosticAlerts);

    // 8. Generate 200 Trip Records
    const tripRecords: TripRecord[] = [];
    const routePool = [
      'Mumbai to Pune Expressway',
      'Bangalore to Chennai NH-44 Corridor',
      'Delhi to Jaipur National Highway',
      'Hyderabad to Bangalore Cargo Route',
      'Kolkata to Patna Hub Logistics Route',
      'Ahmedabad to Vadodara Tollway Run',
      'Pune to Aurangabad Supply Corridor',
      'Chennai to Coimbatore Highroad Route'
    ];

    for (let i = 1; i <= 200; i++) {
      const driver = this.getRandomItem(driversList);
      const route = this.getRandomItem(routePool);
      const distance = Math.floor(120 + Math.random() * 380);
      const hours = Math.floor(distance / (50 + Math.random() * 15));
      const duration = `${hours}h ${Math.floor(Math.random() * 59)}m`;
      const status: TripRecord['status'] = i <= 10 ? 'Active' : (i <= 15 ? 'Cancelled' : 'Completed');

      tripRecords.push({
        id: `t-${500 + i}`,
        driverId: driver.id,
        driverName: driver.name,
        date: `2026-07-${String(Math.floor(1 + Math.random() * 17)).padStart(2, '0')}`,
        route,
        distance,
        duration,
        status
      });
    }
    this.tripRecords$.next(tripRecords);

    // 9. Parts stock in INR
    this.parts$.next([
      { id: 'p-401', name: 'Tata Prima Front Drum Brake Pad', partNumber: 'BP-IN-TAT77', stock: 14, minThreshold: 5, price: 6200, rackLocation: 'A-02' },
      { id: 'p-402', name: 'Ashok Leyland Fuel Filter Core', partNumber: 'FF-IN-AL201', stock: 3, minThreshold: 6, price: 2800, rackLocation: 'B-12' },
      { id: 'p-403', name: 'BharatBenz Air Purifier Intake Element', partNumber: 'AP-IN-BB309', stock: 2, minThreshold: 4, price: 4500, rackLocation: 'C-04' },
      { id: 'p-404', name: 'Castrol Synthetic Engine Oil 15W-40 (5L)', partNumber: 'OIL-CAS15W40', stock: 45, minThreshold: 10, price: 3200, rackLocation: 'Bulk-1' },
      { id: 'p-405', name: 'Force Traveller Fuel Injector Nozzle', partNumber: 'FI-NOZ-FOR9', stock: 12, minThreshold: 5, price: 8900, rackLocation: 'C-08' }
    ]);

    // 10. Generate 10 Support Tickets
    const tickets: SupportTicket[] = [];
    const ticketSubjects = ['Vehicle GPS tracking latency', 'Incorrect maintenance alerts DTC', 'Driver ratings not updating'];
    for (let i = 1; i <= 10; i++) {
      tickets.push({
        id: `t-${100 + i}`,
        subject: this.getRandomItem(ticketSubjects),
        description: 'Detailing systemic concerns regarding logistics operations and telemetry.',
        category: 'Technical',
        createdDate: `2026-07-1${i % 8}`,
        status: i < 6 ? 'Closed' : 'Open',
        customerName: 'Rahul Sharma (Fleet Owner)',
        customerEmail: 'owner@fleetfix.com'
      });
    }
    this.tickets$.next(tickets);

    // 11. Create initial mock users for authentication roles
    const users: User[] = [
      { id: 'user-admin', email: 'admin@fleetfix.com', name: 'Sarah Connor (Admin)', role: 'admin', notificationsEnabled: true, theme: 'glass', status: 'Active' },
      { id: 'user-owner', email: 'owner@fleetfix.com', name: 'Rahul Sharma (Owner)', role: 'fleet-owner', company: 'Blue Dart Logistics', phone: '+91 9876543210', notificationsEnabled: true, theme: 'glass', status: 'Active' },
      { id: 'user-shop', email: 'garage@fleetfix.com', name: 'Sanjay Patel (Service Center)', role: 'service-center', company: 'Balaji Fleet Services', phone: '+91 9988776655', notificationsEnabled: true, theme: 'glass', status: 'Active' }
    ];
    this.users$.next(users);
  }

  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'enc_' + Math.abs(hash).toString(16);
  }

  private loadUsers(): User[] {
    const raw = localStorage.getItem('ff_users');
    if (raw) {
      return JSON.parse(raw);
    }
    // Seed default users
    const defaultUsers: User[] = [
      { id: 'user-owner', email: 'owner@fleetfix.com', name: 'Sai Kiran', role: 'fleet-owner', company: 'Visakhapatnam Logistics', phone: '+91 9876543210', notificationsEnabled: true, theme: 'glass', status: 'Active', avatarUrl: '/images/drivers/sai_kiran.png' },
      { id: 'user-admin', email: 'admin@fleetfix.com', name: 'Venkatesh Reddy', role: 'admin', company: 'System Fleet Operations', phone: '+91 9000000002', notificationsEnabled: true, theme: 'glass', status: 'Active', avatarUrl: '/images/drivers/venkatesh_reddy.png' },
      { id: 'user-shop', email: 'garage@fleetfix.com', name: 'Mahesh Reddy', role: 'service-center', company: 'Raju Garage Centers', phone: '+91 9000000003', notificationsEnabled: true, theme: 'glass', status: 'Active', avatarUrl: '/images/drivers/mahesh_reddy.png' },
      { id: 'user-ravi', email: 'ravi@fleetfix.com', name: 'Ravi Teja', role: 'fleet-owner', company: 'Ravi Transport', phone: '+91 9000000004', notificationsEnabled: true, theme: 'glass', status: 'Active', avatarUrl: '/images/drivers/ravi_teja.png' }
    ];
    localStorage.setItem('ff_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem('ff_users', JSON.stringify(users));
  }

  private loadPasswords(): Record<string, string> {
    const raw = localStorage.getItem('ff_passwords');
    if (raw) {
      return JSON.parse(raw);
    }
    // Seed default passwords (pre-hashed)
    const defaultPasswords: Record<string, string> = {
      'owner@fleetfix.com': this.hashPassword('owner123'),
      'admin@fleetfix.com': this.hashPassword('admin123'),
      'garage@fleetfix.com': this.hashPassword('garage123'),
      'ravi@fleetfix.com': this.hashPassword('ravi123')
    };
    localStorage.setItem('ff_passwords', JSON.stringify(defaultPasswords));
    return defaultPasswords;
  }

  private savePasswords(passwords: Record<string, string>): void {
    localStorage.setItem('ff_passwords', JSON.stringify(passwords));
  }

  private loadOtps(): Record<string, { code: string; expiry: number }> {
    const raw = localStorage.getItem('ff_otps');
    return raw ? JSON.parse(raw) : {};
  }

  private saveOtps(otps: Record<string, { code: string; expiry: number }>): void {
    localStorage.setItem('ff_otps', JSON.stringify(otps));
  }

  // Check if session token exists and is valid
  isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    const expiryStr = localStorage.getItem('jwt_token_expiry');
    if (!token || !expiryStr) {
      return false;
    }
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) {
      this.logoutSync();
      return false;
    }
    return !!this.currentUserSubject.value;
  }

  // Synchronous session cleanup
  logoutSync(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_token_expiry');
    localStorage.removeItem('jwt_user_id');
    localStorage.removeItem('jwt_user_email');
    localStorage.removeItem('jwt_user_name');
    localStorage.removeItem('jwt_user_role');
    localStorage.removeItem('jwt_user_avatar');
    this.currentUserSubject.next(null);
  }

  // --- Auth Actions ---
  login(email: string, password: string): Observable<User> {
    const users = this.loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return throwError(() => new Error('Account Not Registered: The email address provided is not registered. Please create an account first.'));
    }

    const passwords = this.loadPasswords();
    if (passwords[email.toLowerCase()] !== this.hashPassword(password)) {
      return throwError(() => new Error('Incorrect Password: The password you entered is incorrect.'));
    }

    if (user.status === 'Blocked') {
      return throwError(() => new Error('Account Disabled: Your account has been suspended by the administrator.'));
    }

    // Success login: Store valid JWT token with 24-hour expiration
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role })) + '.' + Date.now();
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    localStorage.setItem('jwt_token', token);
    localStorage.setItem('jwt_token_expiry', expiry.toString());
    localStorage.setItem('jwt_user_id', user.id);
    localStorage.setItem('jwt_user_email', user.email);
    localStorage.setItem('jwt_user_name', user.name);
    localStorage.setItem('jwt_user_role', user.role);
    localStorage.setItem('jwt_user_avatar', user.avatarUrl || '/images/drivers/sai_kiran.png');

    this.currentUserSubject.next(user);
    return of(user).pipe(delay(this.delayTime));
  }

  register(email: string, name: string, role: User['role'] = 'fleet-owner', additionalFields?: any): Observable<boolean> {
    const users = this.loadUsers();
    
    // Check duplicates
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return throwError(() => new Error('Account Already Exists: A user with this email address is already registered. Please log in directly.'));
    }

    if (additionalFields?.phone && users.some(u => u.phone === additionalFields.phone)) {
      return throwError(() => new Error('Phone Number Already Registered: A user with this mobile number already exists. Please log in instead.'));
    }

    // Create new active user
    const newUser: User = {
      id: `user-${Date.now().toString().slice(-4)}`,
      email,
      name,
      role,
      phone: additionalFields?.phone || '',
      company: additionalFields?.address || '',
      avatarUrl: '/images/drivers/sai_kiran.png',
      notificationsEnabled: true,
      theme: 'glass',
      status: 'Active'
    };

    users.push(newUser);
    this.saveUsers(users);

    const passwords = this.loadPasswords();
    passwords[email.toLowerCase()] = this.hashPassword(additionalFields?.password || '');
    this.savePasswords(passwords);

    return of(true).pipe(delay(this.delayTime));
  }

  logout(): Observable<boolean> {
    this.logoutSync();
    return of(true);
  }

  updateProfile(name: string, phone: string, address: string, city?: string, state?: string, pincode?: string): Observable<User> {
    const current = this.currentUserSubject.value;
    if (!current) {
      return throwError(() => new Error('Session Expired: Please log in again.'));
    }

    const users = this.loadUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === current.email.toLowerCase());
    if (idx !== -1) {
      users[idx].name = name;
      users[idx].phone = phone;
      users[idx].company = address;
      (users[idx] as any).city = city || '';
      (users[idx] as any).state = state || '';
      (users[idx] as any).pincode = pincode || '';
      
      this.saveUsers(users);
      this.currentUserSubject.next(users[idx]);

      localStorage.setItem('jwt_user_name', name);
      return of(users[idx]).pipe(delay(this.delayTime));
    }
    return throwError(() => new Error('User profile not found.'));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const current = this.currentUserSubject.value;
    if (!current) {
      return throwError(() => new Error('Session Expired: Please log in again.'));
    }

    const passwords = this.loadPasswords();
    if (passwords[current.email.toLowerCase()] !== this.hashPassword(currentPassword)) {
      return throwError(() => new Error('Incorrect Password: The current password you entered is incorrect.'));
    }

    passwords[current.email.toLowerCase()] = this.hashPassword(newPassword);
    this.savePasswords(passwords);
    return of(true).pipe(delay(this.delayTime));
  }

  uploadAvatar(avatarUrl: string): Observable<User> {
    const current = this.currentUserSubject.value;
    if (!current) {
      return throwError(() => new Error('Session Expired: Please log in again.'));
    }

    const users = this.loadUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === current.email.toLowerCase());
    if (idx !== -1) {
      users[idx].avatarUrl = avatarUrl;
      this.saveUsers(users);
      this.currentUserSubject.next(users[idx]);
      localStorage.setItem('jwt_user_avatar', avatarUrl);
      return of(users[idx]).pipe(delay(this.delayTime));
    }
    return throwError(() => new Error('User profile not found.'));
  }

  updateSettings(theme: 'dark' | 'light' | 'glass', notificationsEnabled: boolean): Observable<User> {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, theme, notificationsEnabled };
      this.currentUserSubject.next(updated);
      return of(updated).pipe(delay(100));
    }
    return throwError(() => new Error('No logged-in user'));
  }

  // --- Support Tickets ---
  getSupportTickets(): Observable<SupportTicket[]> {
    return this.tickets$.asObservable().pipe(delay(this.delayTime));
  }

  addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'status' | 'createdDate'>): Observable<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `t-${Date.now().toString().slice(-4)}`,
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0]
    };
    this.tickets$.next([newTicket, ...this.tickets$.value]);
    return of(newTicket).pipe(delay(this.delayTime));
  }

  // --- System Users lists for Admins ---
  getUsers(): Observable<User[]> {
    return this.users$.asObservable().pipe(delay(this.delayTime));
  }

  blockUser(userId: string): Observable<boolean> {
    const list = [...this.users$.value];
    const idx = list.findIndex(u => u.id === userId);
    if (idx !== -1) {
      list[idx].status = list[idx].status === 'Blocked' ? 'Active' : 'Blocked';
      this.users$.next(list);
      return of(true).pipe(delay(100));
    }
    return of(false);
  }

  // --- Vehicles REST CRUD ---
  getVehicles(): Observable<Vehicle[]> {
    return this.vehicles$.asObservable().pipe(delay(this.delayTime));
  }

  getVehicleById(id: string): Observable<Vehicle | undefined> {
    return this.vehicles$.pipe(
      map(list => list.find(v => v.id === id)),
      delay(this.delayTime)
    );
  }

  addVehicle(vehicle: Omit<Vehicle, 'id' | 'health' | 'status' | 'latitude' | 'longitude' | 'image' | 'engineTemp' | 'currentSpeed' | 'engineStatus'>): Observable<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `v-${Date.now().toString().slice(-4)}`,
      health: 100,
      status: 'Idle',
      engineTemp: 80,
      currentSpeed: 0,
      engineStatus: 'Inactive',
      latitude: 19.0760,
      longitude: 72.8777,
      image: this.getVehicleImageForModel(vehicle.model, Math.floor(Math.random() * 100))
    };
    const updated = [...this.vehicles$.value, newVehicle];
    this.vehicles$.next(updated);
    return of(newVehicle).pipe(delay(this.delayTime));
  }

  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    const list = this.vehicles$.value;
    const idx = list.findIndex(v => v.id === vehicle.id);
    if (idx !== -1) {
      const updated = [...list];
      updated[idx] = vehicle;
      
      // Sync driver data if changed
      if (vehicle.driverId) {
        const driver = this.drivers$.value.find(d => d.id === vehicle.driverId);
        if (driver) {
          vehicle.driverName = driver.name;
          vehicle.driverPhone = driver.phone;
          vehicle.driverPhoto = driver.avatarUrl;
        }
      } else {
        vehicle.driverName = undefined;
        vehicle.driverPhone = undefined;
        vehicle.driverPhoto = undefined;
      }
      this.vehicles$.next(updated);
      return of(vehicle).pipe(delay(this.delayTime));
    }
    return throwError(() => new Error('Vehicle not found'));
  }

  deleteVehicle(id: string): Observable<boolean> {
    const list = this.vehicles$.value;
    const updated = list.filter(v => v.id !== id);
    this.vehicles$.next(updated);
    return of(true).pipe(delay(this.delayTime));
  }

  getServiceHistory(vehicleId: string): Observable<ServiceRecord[]> {
    return this.serviceRecords$.pipe(
      map(records => records.filter(r => r.vehicleId === vehicleId).sort((a,b) => b.date.localeCompare(a.date))),
      delay(this.delayTime)
    );
  }

  addServiceRecord(record: Omit<ServiceRecord, 'id'>): Observable<ServiceRecord> {
    const newRecord: ServiceRecord = {
      ...record,
      id: `sr-${Date.now().toString().slice(-4)}`
    };
    this.serviceRecords$.next([newRecord, ...this.serviceRecords$.value]);
    
    // Improve vehicle health
    const list = this.vehicles$.value;
    const vIdx = list.findIndex(v => v.id === record.vehicleId);
    if (vIdx !== -1) {
      const updatedVehicles = [...list];
      updatedVehicles[vIdx] = {
        ...updatedVehicles[vIdx],
        health: Math.min(updatedVehicles[vIdx].health + 30, 100),
        status: 'Idle',
        lastService: record.date
      };
      this.vehicles$.next(updatedVehicles);
    }
    
    return of(newRecord).pipe(delay(this.delayTime));
  }

  // --- Drivers REST CRUD ---
  getDrivers(): Observable<Driver[]> {
    return this.drivers$.asObservable().pipe(delay(this.delayTime));
  }

  getDriverById(id: string): Observable<Driver | undefined> {
    return this.drivers$.pipe(
      map(list => list.find(d => d.id === id)),
      delay(this.delayTime)
    );
  }

  addDriver(driver: Omit<Driver, 'id' | 'rating' | 'joinDate' | 'status' | 'avatarUrl'>): Observable<Driver> {
    const newDriver: Driver = {
      ...driver,
      id: `d-${Date.now().toString().slice(-4)}`,
      rating: 5.0,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Available',
      avatarUrl: this.indianDriverAvatars[this.drivers$.value.length % this.indianDriverAvatars.length]
    };
    this.drivers$.next([...this.drivers$.value, newDriver]);
    return of(newDriver).pipe(delay(this.delayTime));
  }

  updateDriver(driver: Driver): Observable<Driver> {
    const list = this.drivers$.value;
    const idx = list.findIndex(d => d.id === driver.id);
    if (idx !== -1) {
      const updated = [...list];
      updated[idx] = driver;
      
      const vehicleList = [...this.vehicles$.value];
      vehicleList.forEach(v => {
        if (v.driverId === driver.id && v.id !== driver.assignedVehicleId) {
          v.driverId = undefined;
          v.driverName = undefined;
          v.driverPhone = undefined;
          v.driverPhoto = undefined;
        }
      });
      if (driver.assignedVehicleId) {
        const vIdx = vehicleList.findIndex(v => v.id === driver.assignedVehicleId);
        if (vIdx !== -1) {
          vehicleList[vIdx].driverId = driver.id;
          vehicleList[vIdx].driverName = driver.name;
          vehicleList[vIdx].driverPhone = driver.phone;
          vehicleList[vIdx].driverPhoto = driver.avatarUrl;
          driver.assignedVehiclePlate = vehicleList[vIdx].plate;
        }
      } else {
        driver.assignedVehiclePlate = undefined;
      }

      this.vehicles$.next(vehicleList);
      this.drivers$.next(updated);
      return of(driver).pipe(delay(this.delayTime));
    }
    return throwError(() => new Error('Driver not found'));
  }

  deleteDriver(id: string): Observable<boolean> {
    const list = this.drivers$.value;
    const updated = list.filter(d => d.id !== id);
    this.drivers$.next(updated);
    
    const vehicleList = this.vehicles$.value.map(v => {
      if (v.driverId === id) {
        return { ...v, driverId: undefined, driverName: undefined, driverPhone: undefined, driverPhoto: undefined };
      }
      return v;
    });
    this.vehicles$.next(vehicleList);
    
    return of(true).pipe(delay(this.delayTime));
  }

  getTripHistory(driverId: string): Observable<TripRecord[]> {
    return this.tripRecords$.pipe(
      map(records => records.filter(t => t.driverId === driverId)),
      delay(this.delayTime)
    );
  }

  // --- Diagnostics & AI Repair ---
  getFaultAlerts(): Observable<FaultAlert[]> {
    return this.faultAlerts$.asObservable().pipe(delay(this.delayTime));
  }

  getAlertById(id: string): Observable<FaultAlert | undefined> {
    return this.faultAlerts$.pipe(
      map(list => list.find(a => a.id === id)),
      delay(this.delayTime)
    );
  }

  generateAIRepairOrder(alertId: string): Observable<AIOrder> {
    const existing = this.aiOrders$.value.find(o => o.alertId === alertId);
    if (existing) {
      return of(existing).pipe(delay(1000));
    }

    const alert = this.faultAlerts$.value.find(a => a.id === alertId);
    if (!alert) {
      return throwError(() => new Error('Fault alert not found'));
    }

    let procedure: string[] = [];
    let tools: string[] = [];
    let parts: { name: string; quantity: number; cost: number }[] = [];
    let timeEstimate = '3.0 Hours';
    let costEstimate = 18500; // in INR

    switch (alert.dtc) {
      case 'P0302':
      case 'P0300':
        procedure = [
          'Inspect Spark Plug on Cylinder for corrosion, gaps, or fuel fouling.',
          'Swap ignition coil pack and check if misfire shifts.',
          'Verify fuel injector nozzle functionality and wiring plug connectivity.',
          'Perform engine compression test to check piston integrity.'
        ];
        tools = ['Spark Plug Socket & Extensions', 'Multimeter', 'Compression Tester Kit'];
        parts = [
          { name: 'Iridium Spark Plug (Tata Genuine)', quantity: 2, cost: 2400 },
          { name: 'Ignition Coil Assembly Pack', quantity: 1, cost: 8900 }
        ];
        timeEstimate = '2.0 Hours';
        costEstimate = 11300;
        break;
      case 'P0420':
        procedure = [
          'Perform exhaust backpressure test to ensure catalytic converter is not clogged.',
          'Inspect O2 sensor voltage response profiles.',
          'Check exhaust plumbing for leaks ahead of the converter.',
          'Replace exhaust catalytic converter core assembly.'
        ];
        tools = ['Oxygen Sensor Socket', 'Exhaust Backpressure Gauge', 'Welding Torch Set'];
        parts = [
          { name: 'Ashok Leyland Catalytic Converter Unit', quantity: 1, cost: 58000 },
          { name: 'Oxygen Sensor Module (Minda)', quantity: 1, cost: 6500 }
        ];
        timeEstimate = '3.5 Hours';
        costEstimate = 64500;
        break;
      case 'P0171':
        procedure = [
          'Perform smoke leak test to verify post-MAF sensor vacuum leaks.',
          'Clean Mass Airflow (MAF) sensor elements using specialized electronic spray.',
          'Check fuel pressure regulator deliveries (must satisfy 50-60 PSI).',
          'Replace intake manifold gasket set.'
        ];
        tools = ['Vacuum Smoke Generator Machine', 'MAF Cleaner Spray', 'Fuel Pressure Gauge'];
        parts = [
          { name: 'Intake Gasket Lining Set', quantity: 1, cost: 2500 },
          { name: 'MAF Sensor Core (Bosch)', quantity: 1, cost: 12400 }
        ];
        timeEstimate = '2.0 Hours';
        costEstimate = 14900;
        break;
      default:
        procedure = [
          'Read OBD-II freeze frame data parameters.',
          'Inspect electrical path testing of related sensors.',
          'Reset code DTC and complete test cycle parameters.'
        ];
        tools = ['OBD-II Scan Tool', 'Digital Multimeter'];
        parts = [{ name: 'Sensor Wiring Connector Harness', quantity: 1, cost: 4200 }];
        timeEstimate = '1.0 Hours';
        costEstimate = 4200;
    }

    const newOrder: AIOrder = {
      alertId: alertId,
      dtc: alert.dtc,
      procedure,
      tools,
      parts,
      timeEstimate,
      costEstimate,
      status: 'Generated'
    };

    this.aiOrders$.next([...this.aiOrders$.value, newOrder]);
    
    // update status
    const alertList = [...this.faultAlerts$.value];
    const aIdx = alertList.findIndex(a => a.id === alertId);
    if (aIdx !== -1) {
      alertList[aIdx].status = 'Repairing';
      this.faultAlerts$.next(alertList);
    }

    return of(newOrder).pipe(delay(1000));
  }

  updateAIOrderStatus(alertId: string, status: AIOrder['status']): Observable<AIOrder> {
    const list = this.aiOrders$.value;
    const idx = list.findIndex(o => o.alertId === alertId);
    if (idx !== -1) {
      const updated = [...list];
      updated[idx] = { ...updated[idx], status };
      this.aiOrders$.next(updated);

      if (status === 'Completed') {
        const alertList = [...this.faultAlerts$.value];
        const aIdx = alertList.findIndex(a => a.id === alertId);
        if (aIdx !== -1) {
          alertList[aIdx].status = 'Resolved';
          this.faultAlerts$.next(alertList);
          
          const vehicleId = alertList[aIdx].vehicleId;
          const vList = [...this.vehicles$.value];
          const vIdx = vList.findIndex(v => v.id === vehicleId);
          if (vIdx !== -1) {
            vList[vIdx].health = 98;
            this.vehicles$.next(vList);
          }
        }
      }

      return of(updated[idx]).pipe(delay(150));
    }
    return throwError(() => new Error('Order not found'));
  }

  // --- Inventory API ---
  getParts(): Observable<Part[]> {
    return this.parts$.asObservable().pipe(delay(this.delayTime));
  }

  searchParts(query: string): Observable<Part[]> {
    return this.parts$.pipe(
      map(parts => parts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.partNumber.toLowerCase().includes(query.toLowerCase())
      )),
      delay(this.delayTime)
    );
  }

  updatePartStock(partId: string, delta: number): Observable<Part> {
    const list = this.parts$.value;
    const idx = list.findIndex(p => p.id === partId);
    if (idx !== -1) {
      const updated = [...list];
      const newStock = Math.max(0, updated[idx].stock + delta);
      updated[idx] = { ...updated[idx], stock: newStock };
      this.parts$.next(updated);
      return of(updated[idx]).pipe(delay(100));
    }
    return throwError(() => new Error('Part not found'));
  }
}
