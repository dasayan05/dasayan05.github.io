---
title: "Generative modelling with Score Functions"
publish: true
authors:
    - Ayan Das
date: 2021-07-14
tags:
  - Deep Learning
  - Generative Models
  - Score
  - Langevin
layout: post
category: blog-tut
thumbnail-img: "public/posts_res/19/score.png"
---

Generative Models are of immense interest in fundamental research due to their ability to model the "all important" data distribution. A large class of generative models fall into the category of [Probabilistic Graphical Models]({% post_url blog-tut/2019-11-20-inference-in-pgm %}) or PGMs. PGMs (e.g. [VAE]({% post_url blog-tut/2020-01-01-variational-autoencoder %})) usually train a parametric distribution (encoded in the form of graph structure) by minimizing log-likelihood, and samples from it by virtue of ancestral sampling. GANs, another class of popular generative model, take a different approach for training as well as sampling. Both class of models however, suffer from several drawbacks, e.g. difficult log-likelihood computation, unstable training etc. Recently, efforts have been made to craft generative models that inherit all good qualities from the existing ones. One of the rising classes of generative models is called "*Score based Models*". Rather than explicitly maximizing the log-likelihood of a parametric density, it creates *a map to navigate the data space*. Once learned, sampling is done by [Langevin Dynamics](https://en.wikipedia.org/wiki/Stochastic_gradient_Langevin_dynamics), an MCMC based method that actually navigates the data space using the map and lands on regions with high probability under empirical data distribution (i.e. real data regions). In this articles, we will describe the fundamentals of Score based models along with few of its variants.

## Traditional maximum-likelihood (MLE)

Traditional log-likelihood based approaches define a parametric generative process in terms of [graphical model]({% post_url blog-tut/2019-11-20-inference-in-pgm %}) and maximize the joint density $$p_{\theta}(\mathbf{x})$$ w.r.t its parameters $$\theta$$

\\[\tag{1}
\theta^* = arg\max_{\theta} \big[ \log p_{\theta}(\mathbf{x}) \big]
\\]

The joint density is often quite complex and sometimes intractable. For intractable cases, we maximize a surrogate objective based on e.g. [Variational Inference]({% post_url blog-tut/2020-01-01-variational-autoencoder %}). We achieve the above in practice by moving the parameters in the direction where the expected log-likelihood increases the most at every step $$t$$. The expectation is computed empirically at points sampled from our dataset, i.e. the unknown data distribution $$p_{\mathrm{data}}(\mathbf{x})$$

\\[
\theta_{t+1} = \theta_t + \alpha \cdot \mathbb{E}\_{\mathbf{x} \sim p_{\mathrm{data}}(\mathbf{x})} \big[ \nabla\_{\theta} \log p_{\theta}(\mathbf{x}) \big]
\\]

With a trained set of parameters $$\theta^*$$, we sample from the model with ancestral sampling by exploiting its graphical structure

\\[\tag{2}
\mathbf{x}\_{\mathrm{sample}} \sim p\_{\theta^*}(\mathbf{x})
\\]

There is one annoying requirement both in (1) and (2): the parametric model $$p_{\theta}(\mathbf{x})$$ must be a valid density. We ensure such requirement by building the model only carefully combining known densities like Gaussian, Bernoulli, Dirichlet etc. Even though they are largly sufficient in terms of expressiveness, it might feel a bit too restrictive from system designer's perspective.

## Score based models (SBMs)

A new and emerging class of generative model, namely "Score based models (SBM)" entirely sidesteps the log-likelihood modelling and approaches the problem in a different way. In specific, SBMs attempt to learn a *navigation map* on the data space which guides any point on that space to reach a region highly probable under the data distribution $$p_{\mathrm{data}}(\mathbf{x})$$. A little but careful though on this would lead us to something formally known as the *Score function*. The "Score" of an arbitrary point $$\mathbf{x} \in \mathbb{R}^d$$ on the data space is essentially the gradient of the *true* data log-likelihood on that point

\\[\tag{3}
\mathbf{s}(\mathbf{x}) \triangleq \nabla\_{\mathbf{x}} \log p_{\mathrm{data}}(\mathbf{x}) \in \mathbb{R}^d
\\]

Please be careful and notice that the quantity on the right hand side of (3), i.e. $$\nabla_{\mathbf{x}} \log p_{\mathrm{data}}(\mathbf{x})$$ is **not** same as $$\nabla_{\theta} \log p_{\theta}(\mathbf{x})$$, the quantity we encountered earlier (in MLE setup), even though they look structurally similar.

Given *any* point on the data space, the score tells us which direction to navigate if we would like see a region with higher likelihood. Unsurprisingly, if we take a little step toward the direction suggested by the score, we get a point $$(\mathbf{x} + \alpha \cdot \mathbf{s}(\mathbf{x}))$$ that is slightly more likely under $$p_{\mathrm{data}}(\mathbf{x})$$. This is why I termed it as a "navigation map", as in a guiding document that tells us the direction of the "treasure" (i.e. real data samples). All an SBM does is try to approximate the true score function via a parametric proxy

\\[
\mathbf{s}\_{\theta}(\mathbf{x}) \approx \mathbf{s}(\mathbf{x}) \triangleq \nabla\_{\mathbf{x}} \log p_{\mathrm{data}}(\mathbf{x})
\\]

As simple as it might sound, we construct a regression problem with $$\mathbf{s}(\mathbf{x})$$ as regression targets. We minimize the following loss

\\[
J(\theta) = \mathbb{E}\_{p\_{\mathrm{data}}(\mathbf{x})} \bigg[ \left|\left| \mathbf{s}\_{\theta}(\mathbf{x}) - \mathbf{s}(\mathbf{x}) \right|\right|\_2^2 \bigg] = \mathbb{E}\_{p\_{\mathrm{data}}(\mathbf{x})} \bigg[ \left|\left| \mathbf{s}\_{\theta}(\mathbf{x}) - \nabla\_{\mathbf{x}} \log p_{\mathrm{data}}(\mathbf{x}) \right|\right|_2^2 \bigg]
\\]

This is known as *Score Matching*. Once trained, we simply keep moving in the direction suggested by $$\mathbf{s}_{\theta^*}(\mathbf{x})$$ starting from any random $$\mathbf{x}$$ over finite time horizon $$T$$. In practice, we move with a little bit of stochasticity - the formal procedure is known as *Langevin Dynamics*.

\\[\tag{4}
\mathbf{x}\_{t+1} = \mathbf{x}\_{t} + \alpha_t \cdot \mathbf{s}_{\theta^*}(\mathbf{x}_t) + \sqrt{2 \alpha_t} \cdot \mathbf{z}
\\]

$$\mathbf{z} \sim \mathcal{N}(0, I)$$ is the injected gaussian noise. If $$\alpha_t \rightarrow 0$$ as $$t \rightarrow \infty$$, this process gurantees $$\mathbf{x}_t$$ to be a true sample from $$p_{\mathrm{data}}(\mathbf{x})$$. In practice, we run this process for finite number of steps $$T$$ and assign $$\alpha_t$$ according to a decaying schedule. Please refer to [the original paper](https://www.stats.ox.ac.uk/~teh/research/compstats/WelTeh2011a.pdf) for detailed discussion.

Looks all good. But, there are two problems with optimizing $$J(\theta)$$.

- **Problem 1:** The very obvious one; we don't have access to the true scores $$\mathbf{s}(\mathbf{x}) \triangleq \nabla_{\mathbf{x}} \log p_{\mathrm{data}}(\mathbf{x})$$. No one knows the exact form of $$p_{\mathrm{data}}(\mathbf{x})$$.

- **Problem 2:** The not-so-obvious one; the expection $$\mathbb{E}_{p_{\mathrm{data}}(\mathbf{x})}$$ is a bit problematic. Ideally, the objective must encourage learning the scores all over the data space (i.e. for every $$\mathbf{x} \in \mathbb{R}^d$$). But this isn't possible with an expectation over only the data distribution. The regions of the data space which are unlikely under $$p_{\mathrm{data}}(\mathbf{x})$$ do not get enough supervisory signals.

## Implicit Score Matching (ISM)

[Aapo Hyvärinen, 2005](https://jmlr.org/papers/volume6/hyvarinen05a/old.pdf) solved the first problem quite elegantly and proposed the *Implicit Score Matching* objective $$J_{\mathrm{I}}(\theta)$$ and showed it to be equivalent to $$J(\theta)$$ under some mild regulatory conditions. The following remarkable result was shown in the original paper

\\[
J_{\mathrm{I}}(\theta) = \mathbb{E}\_{p\_{\mathrm{data}}(\mathbf{x})} \bigg[ \frac{1}{2} \left|\left| \mathbf{s}\_{\theta}(\mathbf{x}) \right|\right|^2 + \mathrm{tr}(\nabla_{\mathbf{x}} \mathbf{s}_{\theta}(\mathbf{x})) \bigg]
\\]

The reason it's known to be "remarkable" is the fact that $$J_{\mathrm{I}}(\theta)$$ does not require the true target scores $$\mathbf{s}(\mathbf{x})$$ *at all*. All we need is to compute an expectation w.r.t the data distribution which can be implemented using finite samples from our dataset. One practical problem with this objective is the amount of computation involved in the jacobian $$\nabla_{\mathbf{x}} \mathbf{s}_{\theta}(\mathbf{x})$$. Later, [Song et al., 2019](http://auai.org/uai2019/proceedings/papers/204.pdf) proposed to use the [Hutchinson's trace estimator](https://www.tandfonline.com/doi/abs/10.1080/03610919008812866), a stochastic estimator for computing the trace of a matrix, which simplified the objective further

\\[
J_{\mathrm{I}}(\theta) = \mathbb{E}\_{p\_{\mathbf{v}}} \mathbb{E}\_{p\_{\mathrm{data}}(\mathbf{x})} \bigg[ \frac{1}{2} \left|\left| \mathbf{s}\_{\theta}(\mathbf{x}) \right|\right|^2 + \mathbf{v}^T \nabla_{\mathbf{x}} \mathbf{s}_{\theta}(\mathbf{x}) \mathbf{v} \bigg]
\\]

where $$\mathbf{v} \sim \mathcal{N}(0, \mathbf{I}) \in \mathbb{R}^d$$ is a standard multivariate gaussian RV. This objective is computationally advantageous when used in conjunction with automatic differentiation frameworks (e.g. PyTorch) which can efficiently compute the vector-jacobian product (VJP), namely $$\mathbf{v}^T \nabla_{\mathbf{x}} \mathbf{s}_{\theta}(\mathbf{x})$$.

## Denoising Score Matching (DSM)

In a different approach, [Pascal Vincent, 2011](https://www.iro.umontreal.ca/~vincentp/Publications/DenoisingScoreMatching_NeuralComp2011.pdf) investigated the "unsuspected link" between Score Matching and [Denoising Autoencoders](https://www.jmlr.org/papers/volume11/vincent10a/vincent10a.pdf). This work led to a very efficient and practical objective that is used even in the cutting-edge Score based models. Termed as "Denoising Score Matching (DSM)", this approach mitigates both problem 1 & 2 described above and does so quite elegantly.

To get rid of problem 2, DSM proposes to simply use a noise-perturbed version of the dataset, i.e. replace $$p_{\mathrm{data}}(\mathbf{x})$$ with $$p_{\mathrm{data}}^{\sigma}(\mathbf{\tilde{x}})$$ where

\\[
p_{\mathrm{data}}^{\sigma}(\mathbf{\tilde{x}}) = \int p_{\mathrm{data}}^{\sigma}(\mathbf{\tilde{x}}, \mathbf{x}) d\mathbf{x} \text{,  with  } p_{\mathrm{data}}^{\sigma}(\mathbf{\tilde{x}}, \mathbf{x}) = p_{\mathcal{N}}^{\sigma}(\mathbf{\tilde{x}} \| \mathbf{x}) \cdot p_{\mathrm{data}}(\mathbf{x})
\\]

The above equation basically tells us to create a perturbed/corrupted version of the original dataset by adding simple isotropic gaussian noise whose streangth is controlled by $$\sigma$$, the std deviation of the gaussian. Since gaussian distribution is spanned over the entire space $$\mathbb{R}^d$$, corrupted data samples populate much more region of the entire space and help the parameterized score function learn at regions which were originally unreachable under $$p_{\mathrm{data}}(\mathbf{x})$$. The denoising objective $$J_{\mathrm{D}}(\theta)$$ simply becomes

\\[
J_{\mathrm{D}}(\theta) = \mathbb{E}\_{p\_{\mathrm{data}}^{\sigma}(\mathbf{\tilde{x}})} \bigg[ \left|\left| \mathbf{s}\_{\theta}(\mathbf{\tilde{x}}) - \nabla_{\mathbf{\tilde{x}}} \log p_{\mathrm{data}}^{\sigma}(\mathbf{\tilde{x}}) \right|\right|_2^2 \bigg]
\\]

With a crucial proof shown in the appendix of the [original paper](https://www.iro.umontreal.ca/~vincentp/Publications/DenoisingScoreMatching_NeuralComp2011.pdf), we can have an equivalent (changes shown in blue) version of $$J_{\mathrm{D}}(\theta)$$ as

\\[\tag{5}
J_{\mathrm{D}}(\theta) = \mathbb{E}\_{p\_{\mathrm{data}}^{\sigma}(\color{magenta}{\mathbf{\tilde{x}}, \mathbf{x}})} \bigg[ \left|\left| \mathbf{s}\_{\theta}(\mathbf{\tilde{x}}) - \nabla_{\mathbf{\tilde{x}}} \log \color{magenta}{p_{\mathcal{N}}^{\sigma}(\mathbf{\tilde{x}} \| \mathbf{x})} \right|\right|_2^2 \bigg]
\\]

Note that we now need original-corrupt data pairs $$(\mathbf{\tilde{x}}, \mathbf{x})$$ in order to compute the expectation, which is quite trivial to do. Also realize that the term $$\nabla_{\mathbf{\tilde{x}}} \log p_{\mathcal{N}}^{\sigma}(\mathbf{\tilde{x}} \vert \mathbf{x})$$ is not the data score but related only to the pre-specified noise model with a quite an easy analytic form

\\[
\nabla_{\mathbf{\tilde{x}}} \log p_{\mathcal{N}}^{\sigma}(\mathbf{\tilde{x}} \vert \mathbf{x}) = - \frac{1}{\sigma^2} (\mathbf{\tilde{x}} - \mathbf{x})
\\]

The score function we learn this way isn't actually for our original data distribution $$p_{\mathrm{data}}(\mathbf{x})$$, but rather for the corrupted data distribution $$p_{\mathrm{data}}^{\sigma}(\mathbf{\tilde{x}})$$. The strength $$\sigma$$ decided how well it aligns with the original distribution. If $$\sigma$$ is large, we end up learning too corrupted version of the data distribution; if $$\sigma$$ is small, we no longer get the nice property out of the noise perturbation - so there is a trade-off. Recently, this trade-off has been utilized for learning robust score based models.

## Noise Conditioned Score Network (NCSN)

The idea presented in [Song et al., 2020](https://openreview.net/pdf?id=B1lcYrBgLH) is to have $$L$$ different noise-perturbed data distributions (with different $$\sigma$$) and one score function for each of them. The noise strengths are chosen to be $$\sigma_1 > \sigma_2 > \cdots > \sigma_L$$, so that $$p_{\mathrm{data}}^{\sigma_1}(\mathbf{\tilde{x}})$$ is the most corrupted distribution and $$p_{\mathrm{data}}^{\sigma_L}(\mathbf{\tilde{x}})$$ is the least. Also, instead of having $$L$$ separate score functions, we use one shared score function conditioned on $$\sigma$$, i.e. $$\mathbf{s}_{\theta}(\mathbf{\tilde{x}}; \sigma)$$.

We finally learn the shared score function from the ensamble of $$L$$ distributions

\\[
J_{\mathrm{ncsn}}(\theta) = \frac{1}{L} \sum_{l=1}^L \sigma^2 \cdot J_{\mathrm{D}}^{\sigma_l}(\theta)
\\]

where $$J_{\mathrm{D}}^{\sigma}(\theta)$$ is same as Eq. 5 but uses the shared score network parameterized by $$\sigma$$

\\[
J_{\mathrm{D}}^{\sigma}(\theta) = \mathbb{E}\_{p\_{\mathrm{data}}^{\sigma}(\mathbf{\tilde{x}}, \mathbf{x})} \bigg[ \left|\left| \mathbf{s}\_{\theta}(\mathbf{\tilde{x}}; \sigma) - \nabla_{\mathbf{\tilde{x}}} \log p_{\mathcal{N}}^{\sigma}(\mathbf{\tilde{x}} \| \mathbf{x}) \right|\right|_2^2 \bigg]
\\]

In order to sample, [Song et al., 2020](https://openreview.net/pdf?id=B1lcYrBgLH) proposed a modified version of Langevin Dynamics termed as "Annealed Langevin Dynamics". The idea is simple: we start from a random sample and run the Langevin Dynamics (Eq. 4) using $$\mathbf{s}_{\theta^*}(\mathbf{\tilde{x}}; \sigma_1)$$ for $$T$$ steps. We use the final sample as the initial starting point for the next Langevin Dynamics with $$\mathbf{s}_{\theta^*}(\mathbf{\tilde{x}}; \sigma_2)$$. We repeat this process till we get the final sample from $$\mathbf{s}_{\theta^*}(\mathbf{\tilde{x}}; \sigma_L)$$. The intuition here is to sample at coarse level first and gradually fine-tune it to get high quality samples. The exact algorithm is depicted in Algorithm 1 of [Song et al., 2020](https://openreview.net/pdf?id=B1lcYrBgLH).

## Connection to Stochastic Differential Equations

Recently, [Song et al., 2021](https://arxiv.org/pdf/2011.13456.pdf) have established a surprising connection between Score Models, [Diffusion Models](https://arxiv.org/abs/1503.03585) and Stochastic Differential Equation (SDEs). Diffusion Models are another rising class of generative models fundamentally similar to score based models but with some notable differences. Since we did not discuss Diffusion Models in this article, we cannot fully explain the connection and how to properly utilize it. However, I would like to show a brief preview of where exactly SDEs show up within the material discussed in this article.

[Stochastic Differential Equations (SDEs)](https://en.wikipedia.org/wiki/Stochastic_differential_equation) are stochastic dymanical systems with state $$\mathbf{x}(t)$$, characterized by a *Drift function* $$f(\mathbf{x}, t)$$ and a *Diffusion function* $$g(\mathbf{x}, t)$$

\\[
d \mathbf{x}(t) = f(\mathbf{x}, t) dt + g(\mathbf{x}, t) d\omega(t)
\\]

where $$\omega(t)$$ denotes the [Wiener Process](https://en.wikipedia.org/wiki/Wiener_process) and $$d\omega(t) \sim \mathcal{N}(0, dt)$$. Discritizing the above equation in time yields

\\[\tag{6}
  \mathbf{x}_{t+\Delta t} - \mathbf{x}_t = f(\mathbf{x}_t, t) \Delta t + g(\mathbf{x}_t, t) \Delta \omega\text{,  with }\Delta \omega \sim \mathcal{N}(0, \Delta t)
\\]

To find a connection now, it is only a matter of comparing Eq. 6 with Eq. 4. The sampling process defined by Langevin Dynamics is essentially an SDE discretized in time with

$$
\Delta t = 1 \\
f(\mathbf{x}_t, t) = \alpha_t \cdot \mathbf{s}_{\theta^*}(\mathbf{x}_t) \\
g(\mathbf{x}_t, t) = \sqrt{2 \alpha_t}
$$

---

In another future article, we will explore Diffusion Models along with their connection to SDEs and how we can utilize it to create better generative models.
