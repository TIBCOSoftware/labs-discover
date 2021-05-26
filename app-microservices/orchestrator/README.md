# labs-processmining-api


automatic istio injection at namespace level
````shell
$ kubectl label namespace spark-operator istio-injection=enabled
````

```shell
$ cat <<EOF > istio-cni.yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  components:
    cni:
      enabled: true
  values:
    cni:
      excludeNamespaces:
       - istio-system
       - kube-system
      logLevel: info
EOF
$ istioctl install -f istio-cni.yaml
```


for aws, with ssl termination on loadbalancer :
```shell
$ kubectl patch service istio-ingressgateway --patch "$(cat<<EOF
metadata:
  name: istio-ingressgateway
  namespace: istio-system
annotations:
  service.beta.kubernetes.io/aws-load-balancer-ssl-cert: arn:aws:acm:eu-west-1:404217825284:certificate/a05f79f5-6d2f-416b-bbeb-43bff34f4c4d
  service.beta.kubernetes.io/aws-load-balancer-backend-protocol: tcp
  service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "https"
  service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout: "3600"
EOF
)" -n istio-system
```

then gateway def
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: discover-gateway
  namespace: spark-operator
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "discover.labs.tibco.com"
    tls:
      httpsRedirect: true # sends 301 redirect for http requests
  - port:
      number: 443
      name: https-443
      protocol: HTTP
    hosts:
    - "discover.labs.tibco.com"
```