# DropNest
We are a logistics company that uses ground robot assistants and drones to help deliver small to medium-sized items to users within San Francisco.

## Tech Stack
- **Backend**: Java, SpringBoot, Spring Data JPA
- **Frontend**: React.js, Google Maps API
- **Database**: PostgreSQL

---

## Delivery Flow
1. **Register & Login**  
    Users create an account with basic credentials and profile info.

2. **Create a Delivery Order**  
    Start a new delivery request.

3. **Enter Item Details**  
    Specify item name, weight, and volume

4. **Select Delivery Address**
    - Choose from saved addresses, or
    - Enter a one-time address (with optional "save"")

5. **Set Delivery Preference**  
    - `Speed First`: Faster delivery
    - `Cost First`: Cheaper delivery

6. **System Recommendation**  
    The system lists the options based on:
    - Distance
    - Device availability
    - The selected preference

7. **Confirm Order**  
Select one of the recommendation options and confirm - show price and the estmated time.

8. **Track Delivery in Real Time**  
    Device moves from the station to the destination, progress, status and the estimated time are shown live

9. **Order Completion & History**  
    When delivery is finished, the order will be marked as `DELIVERED` and added to the user's history.

---

## Running Locally
### Prerequisties
- Java 17+
- Node.js
- Docker

### Start Backend
```bash
# Start PostgreSQL
docker-compose up -d

# Run SpringBoot Backend
cd backend/
./gradlew bootRun
```
### Start Frontend
```bash
cd frontend
npm install
npm start
```

## Reference
[Docker Compose Up Documentation](https://docs.docker.com/reference/cli/docker/compose/up/)  
[Spring Boot Getting Started Guide](https://spring.io/guides/gs/spring-boot)