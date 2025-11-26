package auth

import (
	"time"
	"os"
	"fmt"
	"log"
	"errors"
	
	"github.com/golang-jwt/jwt/v5"
)

var signingKey = []byte(getEnv("JWT_SECRET", "dev-secret-change-me"))

func getEnv(k, def string) string {
	v := os.Getenv(k)
	if v == "" {
		if os.Getenv("GO_ENV") == "production" {
			log.Fatalf("FATAL: Environment variable %s not set", k)
		}
		fmt.Printf("WARNING: Environment variable %s not set, using default value\n", k)
		return def
	}
	return v
}


type Claims struct {
	UserID string `json:"uid"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func NewAccessToken (userID, role string, ttl time.Duration) (string, error) {

	claims := &Claims{
		UserID: userID,
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}

	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(signingKey)
}

func Parse(tokenStr string) (*Claims, error) {
	tok, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error){
		return signingKey, nil
	})
	if err != nil || !tok.Valid {	
		return nil, errors.New("invalid token")
		
	}

	claims, ok := tok.Claims.(*Claims)
	if !ok {
		return nil, errors.New("bad claims")
	}
	return claims, nil

}