import { PracticeChallenge } from '../types/terraform';

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
  {
    id: 'challenge-s3-public-access',
    title: 'Challenge 1: Fix LocalStack S3 Public Read Access',
    difficulty: 'Intermediate',
    scenarioDescription: 'Configure an S3 bucket with public read access using LocalStack emulation. Ensure aws_s3_bucket_public_access_block has block_public_policy = false.',
    filename: 'main.tf',
    hint: 'Set block_public_policy = false and block_public_acls = false in aws_s3_bucket_public_access_block.',
    initialCode: `resource "aws_s3_bucket" "test" {
  bucket = "my-test-bucket"
}

resource "aws_s3_bucket_public_access_block" "public" {
  bucket = aws_s3_bucket.test.id

  # Fix: Change these to allow public read
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
`,
    solutionExplanation: 'For public read access, block_public_policy and block_public_acls must be explicitly set to false.',
    validate: (code: string) => {
      const hasBlockPolicyFalse = /block_public_policy\s*=\s*false/.test(code);
      const hasBlockAclsFalse = /block_public_acls\s*=\s*false/.test(code);
      if (hasBlockPolicyFalse && hasBlockAclsFalse) {
        return { passed: true, message: 'Correct! S3 Public Read policies permitted.' };
      }
      return { passed: false, message: 'Both block_public_policy and block_public_acls must be false.' };
    }
  },
  {
    id: 'challenge-imds-v2',
    title: 'Challenge 2: Enforce IMDSv2 on AWS EC2',
    difficulty: 'Advanced',
    scenarioDescription: 'Prevent SSRF security vulnerabilities by enforcing IMDSv2 token requirements on an aws_instance resource.',
    filename: 'main.tf',
    hint: 'Add metadata_options { http_tokens = "required" } inside aws_instance.',
    initialCode: `resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"

  # TODO: Add metadata_options to enforce IMDSv2
}
`,
    solutionExplanation: 'Enforcing IMDSv2 protects against AWS metadata service SSRF attacks (CWE-918).',
    validate: (code: string) => {
      const hasTokensRequired = /http_tokens\s*=\s*"required"/.test(code);
      if (hasTokensRequired) {
        return { passed: true, message: 'Pass! IMDSv2 token enforcement active.' };
      }
      return { passed: false, message: 'Must include metadata_options with http_tokens = "required".' };
    }
  }
];
