# Vue.js App Deployment on AWS (S3 + CloudFront + Auth0)

This repository contains a Vue.js app deployed to AWS S3 + CloudFront
using Terraform.\
Auth0 is used for authentication, with dynamic callback URLs
automatically set for the deployed environment.

------------------------------------------------------------------------

## 🚀 Prerequisites

-   [Node.js 18+](https://nodejs.org/)
-   [Terraform
    1.6+](https://developer.hashicorp.com/terraform/downloads)
-   AWS CLI configured with credentials (`aws configure`)
-   Auth0 account with SPA application created

------------------------------------------------------------------------

## 🏗️ Project Setup

1.  **Install dependencies**

``` bash
npm install
```

2.  **Configure Environment Variables**

Create a `.env.production` file:

``` bash
VITE_API_BASE_URL=https://your-api.com
VITE_AUTH0_DOMAIN=dev-xxxxxx.us.auth0.com
VITE_AUTH0_CLIENT_ID=YOUR_CLIENT_ID
VITE_AUTH0_AUDIENCE=https://dev-xxxxxx.us.auth0.com/api/v2/
```

> **Note:** Variables must be prefixed with `VITE_` to be accessible in
> the Vue app.

------------------------------------------------------------------------

## 🏗️ Terraform Deployment

### 1. Initialize Terraform

``` bash
terraform init -upgrade
```

### 2. Deploy Infrastructure

``` bash
terraform apply -auto-approve
```

This will:

-   Create an S3 bucket to store the Vue build
-   Create a CloudFront distribution
-   Output the **CloudFront URL**

### 3. Build & Upload Vue App

``` bash
npm run build
aws s3 sync dist/ s3://<your-bucket-name> --delete
```

------------------------------------------------------------------------

## 🔑 Auth0 Setup

1.  Go to **Auth0 Dashboard → Applications → Your SPA**\
2.  Add the CloudFront URL to:

-   **Allowed Callback URLs**\
-   **Allowed Logout URLs**\
-   **Allowed Web Origins**

Example:

    https://d2waworiefnlft.cloudfront.net

> You must re-run `terraform apply` if the CloudFront domain changes.

------------------------------------------------------------------------

## 🔄 Logout Handling

The logout URL is dynamically generated:

``` ts
const returnTo = window.location.origin;
window.location.href = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/v2/logout?client_id=${
  import.meta.env.VITE_AUTH0_CLIENT_ID
}&returnTo=${encodeURIComponent(returnTo)}`;
```

------------------------------------------------------------------------

## 🧹 Destroy Environment

When done testing, clean up AWS resources:

``` bash
terraform destroy -auto-approve
```

This deletes:

-   S3 bucket
-   CloudFront distribution

------------------------------------------------------------------------

## 🏗️ Terraform Example (main.tf)

``` hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "vue_app" {
  bucket        = "my-vue-app-${random_id.suffix.hex}"
  force_destroy = true
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket                  = aws_s3_bucket.vue_app.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "Access Identity for Vue App"
}

resource "aws_s3_bucket_policy" "public_access" {
  bucket = aws_s3_bucket.vue_app.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = "*",
      Action    = ["s3:GetObject"],
      Resource  = "${aws_s3_bucket.vue_app.arn}/*"
    }]
  })
}

resource "aws_cloudfront_distribution" "vue_cdn" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.vue_app.bucket_regional_domain_name
    origin_id   = "vueAppS3"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "vueAppS3"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "cloudfront_url" {
  value = aws_cloudfront_distribution.vue_cdn.domain_name
}
```

------------------------------------------------------------------------

## 📝 Notes

-   **Costs:** S3 + CloudFront are free-tier eligible (50 GB/month
    storage, 1 TB CloudFront data transfer for 12 months).\
-   **Security:** No public ACLs, CloudFront OAI used for secure access.
-   **Auth0:** Make sure your callback/logout URLs match exactly.

------------------------------------------------------------------------

## ✅ Summary

With this setup:

-   Vue app is deployed to S3 + CloudFront
-   Callback & logout URLs are predictable (CloudFront URL)
-   Everything is managed with Terraform
-   You can tear down & redeploy easily

## 🧹 Teardown / Destroy Environment

When you want to completely remove the deployed Vue app from AWS, follow these steps.

---

### 1️⃣ Empty the S3 Bucket

Terraform cannot delete a non-empty bucket. First, empty your bucket.

**Option 1: Use Terraform output (recommended)**

Make sure you have an output for the bucket name in your `main.tf`:

```hcl
output "vue_bucket_name" {
  value = aws_s3_bucket.vue_app.bucket
}

terraform apply -auto-approve

aws s3 rm s3://$(terraform output -raw vue_bucket_name) --recursive

terraform state show aws_s3_bucket.vue_app | grep "bucket ="
# Copy the bucket name
aws s3 rm s3://<bucket-name> --recursive

terraform destroy -auto-approve

3️⃣ Verify Deletion

S3 bucket:

aws s3 ls | grep vue-app

CloudFront distribution:

aws cloudfront list-distributions

⚠️ CloudFront deletion can take 15–20 minutes. Terraform waits until it is fully removed.