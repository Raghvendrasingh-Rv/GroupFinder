import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "GroupFinder API",
    version: "1.0.0",
    description: "API documentation for the GroupFinder backend"
  },
  servers: [
    {
      url: "http://localhost:4000/api",
      description: "Local API server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      SendOtpRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@example.com"
          }
        }
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@example.com"
          },
          otp: {
            type: "string",
            example: "123456"
          }
        }
      },
      SendOtpResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "OTP sent successfully" },
          data: {
            type: "object",
            properties: {
              email: { type: "string", example: "user@example.com" },
              expiresInSeconds: { type: "integer", example: 300 }
            }
          }
        }
      },
      VerifyOtpResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "OTP verified successfully" },
          data: {
            type: "object",
            properties: {
              token: { type: "string", example: "eyJhbGciOi..." },
              tokenType: { type: "string", example: "Bearer" },
              userId: { type: "string", example: "uuid-here" }
            }
          }
        }
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          username: {
            type: "string",
            example: "Aarav"
          },
          latitude: {
            type: "number",
            example: 12.9716
          },
          longitude: {
            type: "number",
            example: 77.5946
          }
        }
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string", example: "uuid-here" },
          email: { type: "string", example: "user@example.com" },
          username: { type: "string", example: "Aarav" },
          mobileNumber: { type: "string", nullable: true, example: "9000000001" },
          latitude: { type: "number", nullable: true, example: 12.9716 },
          longitude: { type: "number", nullable: true, example: 77.5946 },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      CurrentUserResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/UserResponse" }
        }
      },
      UpdateUserResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Profile updated successfully" },
          data: { $ref: "#/components/schemas/UserResponse" }
        }
      },
      CreateEventRequest: {
        type: "object",
        required: ["category", "title", "description", "eventAddress", "eventDate", "eventTime", "maxParticipants"],
        properties: {
          category: { type: "string", example: "Tech" },
          title: { type: "string", example: "React Builders Meetup" },
          description: { type: "string", example: "A meetup for frontend enthusiasts." },
          eventAddress: { type: "string", example: "Koramangala, Bengaluru" },
          eventDate: { type: "string", example: "2026-04-10" },
          eventTime: { type: "string", example: "10:00" },
          maxParticipants: { type: "integer", example: 30 }
        }
      },
      CreateEventResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Event created successfully" },
          data: { $ref: "#/components/schemas/EventResponse" }
        }
      },
      EventResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          creatorId: { type: "string" },
          category: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          eventAddress: { type: "string" },
          eventDate: { type: "string", format: "date" },
          eventTime: { type: "string" },
          maxParticipants: { type: "integer" },
          currentParticipants: { type: "integer" },
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      EventListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/EventResponse" }
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer", example: 10 },
              limit: { type: "integer", example: 10 },
              offset: { type: "integer", example: 0 },
              locationFilter: {
                oneOf: [
                  { type: "null" },
                  {
                    type: "object",
              properties: {
                    latitude: { type: "number", example: 12.9716 },
                    longitude: { type: "number", example: 77.5946 },
                    radius: { type: "number", example: 5 }
                  }
                }
              ]
              }
            }
          },
          note: { type: "string", nullable: true }
        }
      },
      EventByCategoryResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/EventResponse" }
          }
        }
      },
      EventByTimingResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/EventResponse" }
          },
          meta: {
            type: "object",
            properties: {
              timing: { type: "string", example: "today" }
            }
          }
        }
      },
      SendJoinRequestResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Join request sent successfully" },
          data: {
            type: "object",
            properties: {
              id: { type: "string" },
              eventId: { type: "string" },
              userId: { type: "string" },
              status: { type: "string", example: "PENDING" },
              createdAt: { type: "string", format: "date-time" }
            }
          }
        }
      },
      ProcessRequestResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Request accepted successfully" },
          data: {
            type: "object",
            properties: {
              request: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  status: { type: "string" }
                }
              },
              event: { $ref: "#/components/schemas/EventResponse" }
            }
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid OTP" }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ["src/modules/**/*.ts", "src/routes/*.ts"]
};

export const swaggerSpec = swaggerJSDoc(options);
