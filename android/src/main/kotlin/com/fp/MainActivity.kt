package com.fp

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.widget.Toast
import com.fp.Hello.*
import io.grpc.ManagedChannelBuilder

class MainActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    val request = HelloRequest
      .newBuilder()
      .setName("Android")
      .build()

    request.toString()

    val channel = ManagedChannelBuilder
      .forAddress("10.0.1.5", 50051)
      .usePlaintext()
      .build()

    val helloService = HelloServiceGrpc.newBlockingStub(channel)

    val reply = helloService.sayHello(request)

    Toast.makeText(this, reply.message, Toast.LENGTH_LONG).show()

    channel.shutdownNow()
  }
}
