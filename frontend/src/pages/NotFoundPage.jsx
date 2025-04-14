import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section class=" containerStyled">
      <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div class="mx-auto max-w-screen-sm text-center">
          <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-gray-200">
            404
          </h1>
          <p class="mb-4 text-3xl tracking-tight font-bold text-gray-300 md:text-4xl dark:text-white">
            Something's missing.
          </p>
          <p class="mb-4 text-lg font-light text-gray-400">
            Sorry, we can't find that page. You'll find lots to explore on the
            home page.{" "}
          </p>

          <Link
            to="/"
            class="inline-flex text-gray-800 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-gray-300 my-4"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
