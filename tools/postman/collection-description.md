## MongoDB Atlas Administration API

This collection is an introduction to the [MongoDB Atlas Administration API](https://www.mongodb.com/docs/atlas/reference/api-resources-spec/v2/). The MongoDB Atlas Administration API offers a method to manage your [MongoDB Atlas clusters](https://www.mongodb.com/resources/products/fundamentals/clusters) following the principles of the REST architectural style. To learn more, visit the [MongoDB Atlas Administration API documentation](https://www.mongodb.com/docs/atlas/api/atlas-admin-api-ref/).

## Getting Started

To test out the MongoDB Atlas Admin API collection, start by [creating a free MongoDB Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/).  
Once you have a cluster, you can [fork this collection](https://learning.postman.com/docs/collaborating-in-postman/using-version-control/forking-elements/\#create-a-fork) into your own workspace in order to manage your MongoDB Atlas resources. Make sure to also fork the MongoDB Atlas Administration API Environment at the same time.

Once you have your cluster up and running, follow [this guide](https://www.mongodb.com/docs/atlas/configure-api-access/) to find your public and private API keys. Set each of these values as secrets in the [Postman Vault](https://learning.postman.com/docs/sending-requests/postman-vault/postman-vault-secrets/): 

- public API key as the value for a key named \`mongodb-public-api-key\`  
- private API key as the value for a key named  \`mongodb-private-api-key\`

You can now explore the various endpoints. For each endpoint, edit the query and path variables such as group ID and organization ID. For some requests, like POST requests, editing the body of the request is also required. 

For more details, you can follow along with the [Configuring Atlas in Postman With the Atlas Administration API](https://www.mongodb.com/developer/products/atlas/admin-api-postman/) blog.
