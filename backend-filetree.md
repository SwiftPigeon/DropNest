dropnest-backend/
├── build.gradle.kts                          # Gradle build configuration
├── settings.gradle.kts                       # Gradle settings
├── gradle.properties                         # Gradle properties
├── gradlew                                   # Gradle wrapper script (Unix)
├── gradlew.bat                              # Gradle wrapper script (Windows)
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── docker-compose.yml                        # Docker compose for local development
├── Dockerfile                               # Docker image configuration
├── README.md                                # Project documentation
├── .gitignore                              # Git ignore rules
├── .env.example                            # Environment variables example
└── src/
    ├── main/
    │   ├── kotlin/
    │   │   └── com/
    │   │       └── swiftpigeon/
    │   │           └── dropnest/
    │   │               ├── DropNestApplication.kt              # Main application class
    │   │               ├── config/                            # Configuration classes
    │   │               │   ├── SecurityConfig.kt
    │   │               │   ├── WebSocketConfig.kt
    │   │               │   ├── RedisConfig.kt
    │   │               │   ├── DatabaseConfig.kt
    │   │               │   └── CorsConfig.kt
    │   │               ├── controller/                        # REST Controllers
    │   │               │   ├── AuthController.kt
    │   │               │   ├── UserController.kt
    │   │               │   ├── AddressController.kt
    │   │               │   ├── StationController.kt
    │   │               │   ├── OrderController.kt
    │   │               │   ├── TrackingController.kt
    │   │               │   ├── PaymentController.kt
    │   │               │   ├── ReviewController.kt
    │   │               │   ├── NotificationController.kt
    │   │               │   └── ConfigController.kt
    │   │               ├── websocket/                         # WebSocket handlers
    │   │               │   ├── TrackingWebSocketHandler.kt
    │   │               │   └── WebSocketSessionManager.kt
    │   │               ├── service/                           # Business logic services
    │   │               │   ├── AuthService.kt
    │   │               │   ├── UserService.kt
    │   │               │   ├── AddressService.kt
    │   │               │   ├── StationService.kt
    │   │               │   ├── OrderService.kt
    │   │               │   ├── TrackingService.kt
    │   │               │   ├── PaymentService.kt
    │   │               │   ├── ReviewService.kt
    │   │               │   ├── NotificationService.kt
    │   │               │   ├── PricingService.kt
    │   │               │   └── DeviceManagementService.kt
    │   │               ├── repository/                        # Data access layer
    │   │               │   ├── UserRepository.kt
    │   │               │   ├── AddressRepository.kt
    │   │               │   ├── StationRepository.kt
    │   │               │   ├── OrderRepository.kt
    │   │               │   ├── TrackingRepository.kt
    │   │               │   ├── PaymentRepository.kt
    │   │               │   ├── ReviewRepository.kt
    │   │               │   ├── NotificationRepository.kt
    │   │               │   └── DeviceRepository.kt
    │   │               ├── entity/                            # JPA entities
    │   │               │   ├── User.kt
    │   │               │   ├── Address.kt
    │   │               │   ├── Station.kt
    │   │               │   ├── Order.kt
    │   │               │   ├── OrderItem.kt
    │   │               │   ├── TrackingInfo.kt
    │   │               │   ├── Payment.kt
    │   │               │   ├── Review.kt
    │   │               │   ├── Notification.kt
    │   │               │   ├── Device.kt
    │   │               │   └── BaseEntity.kt
    │   │               ├── dto/                               # Data Transfer Objects
    │   │               │   ├── request/
    │   │               │   │   ├── AuthRequest.kt
    │   │               │   │   ├── UserRequest.kt
    │   │               │   │   ├── AddressRequest.kt
    │   │               │   │   ├── OrderRequest.kt
    │   │               │   │   ├── PaymentRequest.kt
    │   │               │   │   └── ReviewRequest.kt
    │   │               │   ├── response/
    │   │               │   │   ├── AuthResponse.kt
    │   │               │   │   ├── UserResponse.kt
    │   │               │   │   ├── AddressResponse.kt
    │   │               │   │   ├── StationResponse.kt
    │   │               │   │   ├── OrderResponse.kt
    │   │               │   │   ├── TrackingResponse.kt
    │   │               │   │   ├── PaymentResponse.kt
    │   │               │   │   ├── ReviewResponse.kt
    │   │               │   │   ├── NotificationResponse.kt
    │   │               │   │   └── ConfigResponse.kt
    │   │               │   └── common/
    │   │               │       ├── ApiResponse.kt
    │   │               │       ├── PageResponse.kt
    │   │               │       └── ErrorResponse.kt
    │   │               ├── enums/                             # Enums
    │   │               │   ├── OrderStatus.kt
    │   │               │   ├── DeliveryType.kt
    │   │               │   ├── DeliverySpeed.kt
    │   │               │   ├── PaymentMethod.kt
    │   │               │   ├── PaymentStatus.kt
    │   │               │   ├── NotificationType.kt
    │   │               │   ├── DeviceType.kt
    │   │               │   └── AddressLabel.kt
    │   │               ├── exception/                         # Exception handling
    │   │               │   ├── GlobalExceptionHandler.kt
    │   │               │   ├── BusinessException.kt
    │   │               │   ├── ResourceNotFoundException.kt
    │   │               │   ├── ValidationException.kt
    │   │               │   └── AuthenticationException.kt
    │   │               ├── security/                          # Security components
    │   │               │   ├── JwtTokenProvider.kt
    │   │               │   ├── JwtAuthenticationFilter.kt
    │   │               │   ├── CustomUserDetailsService.kt
    │   │               │   └── SecurityUtils.kt
    │   │               ├── validation/                        # Custom validators
    │   │               │   ├── PhoneNumberValidator.kt
    │   │               │   ├── CoordinateValidator.kt
    │   │               │   └── WeightVolumeValidator.kt
    │   │               ├── utils/                             # Utility classes
    │   │               │   ├── DateUtils.kt
    │   │               │   ├── GeoUtils.kt
    │   │               │   ├── PriceCalculator.kt
    │   │               │   └── TrackingNumberGenerator.kt
    │   │               ├── scheduler/                         # Scheduled tasks
    │   │               │   ├── OrderStatusScheduler.kt
    │   │               │   ├── DeviceSimulationScheduler.kt
    │   │               │   └── NotificationScheduler.kt
    │   │               └── simulation/                        # Simulation components
    │   │                   ├── DeviceSimulator.kt
    │   │                   ├── RouteSimulator.kt
    │   │                   └── LocationUpdateService.kt
    │   ├── java/                                             # Java source files (if any)
    │   │   └── com/
    │   │       └── swiftpigeon/
    │   │           └── dropnest/
    │   │               └── legacy/                           # Legacy Java components
    │   └── resources/
    │       ├── application.yml                              # Main configuration
    │       ├── application-dev.yml                          # Development config
    │       ├── application-prod.yml                         # Production config
    │       ├── application-test.yml                         # Test config
    │       ├── static/                                      # Static resources
    │       │   └── api-docs/                               # API documentation
    │       ├── templates/                                   # Email templates (if needed)
    │       │   ├── order-confirmation.html
    │       │   └── delivery-notification.html
    │       ├── db/
    │       │   └── migration/                               # Database migrations
    │       │       ├── V1__Create_users_table.sql
    │       │       ├── V2__Create_addresses_table.sql
    │       │       ├── V3__Create_stations_table.sql
    │       │       ├── V4__Create_orders_table.sql
    │       │       ├── V5__Create_devices_table.sql
    │       │       ├── V6__Create_tracking_table.sql
    │       │       ├── V7__Create_payments_table.sql
    │       │       ├── V8__Create_reviews_table.sql
    │       │       ├── V9__Create_notifications_table.sql
    │       │       └── V10__Insert_initial_data.sql
    │       ├── data/                                        # Initial data
    │       │   ├── stations.json                           # Station configuration
    │       │   ├── prohibited-items.json                   # Prohibited items list
    │       │   └── delivery-config.json                    # Delivery configuration
    │       └── logback-spring.xml                          # Logging configuration
    └── test/
        ├── kotlin/
        │   └── com/
        │       └── swiftpigeon/
        │           └── dropnest/
        │               ├── DropNestApplicationTests.kt
        │               ├── controller/                      # Controller tests
        │               │   ├── AuthControllerTest.kt
        │               │   ├── OrderControllerTest.kt
        │               │   └── TrackingControllerTest.kt
        │               ├── service/                         # Service tests
        │               │   ├── AuthServiceTest.kt
        │               │   ├── OrderServiceTest.kt
        │               │   ├── PricingServiceTest.kt
        │               │   └── TrackingServiceTest.kt
        │               ├── repository/                      # Repository tests
        │               │   ├── UserRepositoryTest.kt
        │               │   └── OrderRepositoryTest.kt
        │               ├── integration/                     # Integration tests
        │               │   ├── OrderIntegrationTest.kt
        │               │   └── AuthIntegrationTest.kt
        │               └── utils/                           # Test utilities
        │                   ├── TestDataFactory.kt
        │                   └── TestSecurityConfig.kt
        └── resources/
            ├── application-test.yml                        # Test configuration
            ├── test-data/                                  # Test data files
            │   ├── users.json
            │   ├── orders.json
            │   └── stations.json
            └── db/
                └── test-data.sql                           # Test database data