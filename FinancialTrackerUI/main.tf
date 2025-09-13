terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "random_id" "suffix" {
  byte_length = 4
}

# 1️⃣ Create Private S3 Bucket
resource "aws_s3_bucket" "vue_app" {
  bucket        = "my-vue-app-${random_id.suffix.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket                  = aws_s3_bucket.vue_app.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2️⃣ Create CloudFront Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "vue-app-oac"
  description                       = "Origin Access Control for Vue App"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 3️⃣ Attach Bucket Policy Allowing Only CloudFront OAC to Read
data "aws_iam_policy_document" "bucket_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.vue_app.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.vue_cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.vue_app.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

# 4️⃣ Create CloudFront Distribution
resource "aws_cloudfront_distribution" "vue_cdn" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.vue_app.bucket_regional_domain_name
    origin_id                = "vue-app-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "vue-app-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# 5️⃣ Outputs
output "cloudfront_domain" {
  description = "CloudFront domain to access the Vue app"
  value       = aws_cloudfront_distribution.vue_cdn.domain_name
}

output "vue_app_bucket" {
  description = "Name of the S3 bucket where the Vue app will be uploaded"
  value       = aws_s3_bucket.vue_app.bucket
}
