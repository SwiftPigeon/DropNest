package com.swiftpigeon.backend.model;


import jakarta.persistence.*;


import java.util.Objects;


@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    @Enumerated(EnumType.STRING)
    private com.swiftpigeon.backend.model.UserRole role;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    private Address address;


    public UserEntity() {
    }


    public UserEntity(Long id, String username, String password, String email, String firstName, String lastName, com.swiftpigeon.backend.model.UserRole role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }
    
    public UserEntity(Long id, String username, String password, String email, String firstName, String lastName, com.swiftpigeon.backend.model.UserRole role, Address address) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.address = address;
    }


    public String getPassword() {
        return password;
    }
    
    
    public void setPassword(String password) {
        this.password = password;
    }


    public String getUsername() {
        return username;
    }


    public Long getId() {
        return id;
    }


    public com.swiftpigeon.backend.model.UserRole getRole() {
        return role;
    }
    
    
    public String getEmail() {
        return email;
    }
    
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    
    public String getFirstName() {
        return firstName;
    }
    
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    
    public String getLastName() {
        return lastName;
    }
    
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    
    public Address getAddress() {
        return address;
    }
    
    
    public void setAddress(Address address) {
        this.address = address;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserEntity that = (UserEntity) o;
        return Objects.equals(id, that.id) && Objects.equals(username, that.username) && 
               Objects.equals(password, that.password) && Objects.equals(email, that.email) && 
               Objects.equals(firstName, that.firstName) && Objects.equals(lastName, that.lastName) && 
               role == that.role && Objects.equals(address, that.address);
    }


    @Override
    public int hashCode() {
        return Objects.hash(id, username, password, email, firstName, lastName, role, address);
    }


    @Override
    public String toString() {
        return "UserEntity{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", role=" + role +
                ", address=" + address +
                '}';
    }
}

