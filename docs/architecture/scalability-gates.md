# SCALABILITY GATES V2

## Principle

Scale by measurement.

500–1.000 clients are a design target, not a substitute for workload data.

## Operational signals

- queue oldest age;
- jobs/hour;
- final minutes/day;
- provider rate-limit rate;
- worker utilization;
- DB CPU/connections;
- object storage/egress;
- API p95;
- STP Rate;
- Exception Rate;
- Human Minutes per Final Hour;
- Cost per Approved Minute.

## Promotion gates

### SG-01 Worker scale
Trigger: queue age/SLA risk with provider capacity available.  
Action: increase worker consumers.

### SG-02 Queue split
Trigger: one workload causes head-of-line blocking or materially different retry/latency profile.  
Action: split queue, preserve contract.

### SG-03 Compute horizontal scale
Trigger: sustained compute/resource saturation.  
Action: second instance/container group.

### SG-04 DB capacity
Trigger: measured DB bottleneck after query/index review.  
Action: scale instance/read strategy.

### SG-05 Cache
Trigger: measured repeated hot reads or rate-limit coordination needing cache.  
Action: introduce Redis/managed cache.

### SG-06 Module extraction
Trigger: independent deployment/ownership/scaling need is measured.  
Action: extract boundary to process/service.

### SG-07 Region
Trigger: compliance/geography/latency requirement.  
Action: explicit multi-region design review.

## Anti-gates

Not sufficient:
- “1.000 clientes” alone;
- “microservices scales better”;
- vendor recommendation;
- one traffic spike.
